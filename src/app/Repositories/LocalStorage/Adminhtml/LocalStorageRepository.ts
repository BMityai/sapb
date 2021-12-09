import Database from 'sosise-core/build/Database/Database';
import LocalStorageRepositoryInterface from './LocalStorageRepositoryInterface';
import { Knex } from 'knex';
import StatusMappingType from '../../../Types/StatusMappingType';
import AdminUserType from '../../../Types/AdminUserType';
import WarehouseMappingType from '../../../Types/WarehouseMappingType';
import SaveNewStatuseType from '../../../Types/SaveNewStatuseType';
import SaveNewWarehouseType from '../../../Types/SaveNewWarehouseType';
import CreateUserUnifier from '../../../Unifiers/Adminhtml/CreateUserUnifier';
import bcrypt from 'bcrypt';
import Helper from 'sosise-core/build/Helper/Helper';
import OrdersCountInfoType from '../../../Types/OrdersCountInfoType';
import OrderAppStatusesEnum from '../../../Enums/OrderAppStatusesEnum';
import dayjs from 'dayjs';


export default class LocalStorageRepository implements LocalStorageRepositoryInterface {

    protected dbClient: Knex;

    /**
     * Constructor
     */
    constructor() {
        this.dbClient = Database.getConnection(process.env.DB_PROJECT_CONNECTION as string).client;
    }

    /**
     * Get statuses
     */
    public async getStatuses(): Promise<StatusMappingType[]> {

        // Get statuses
        const statuses = await this.dbClient.table('status_mapping').orderBy('id');

        // Typecast
        const result = new Array();
        for (const status of statuses) {
            result.push(new StatusMappingType(status));
        }
        return result;
    }

    /**
     * Get warehouses
     */
    public async getWarehouses(): Promise<WarehouseMappingType[]> {

        // Get warehouses
        const warehouses = await this.dbClient.table('warehouse_mapping').orderBy('id');
        // Typecast
        const result = new Array();
        for (const warehouse of warehouses) {
            result.push(new WarehouseMappingType(warehouse));
        }
        return result;
    }

    /**
     * Get users
     */
    public async getUsers(): Promise<AdminUserType[]> {
        const users = await this.dbClient.table('admin_user').orderBy('id');
        const preparedData = new Array();
        for (const user of users) {
            preparedData.push({
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                username: user.username,
                email: user.email,
                status: user.status,
                createdAt: new Date(user.created_at).toLocaleString(),
            });
        }

        return preparedData;
    }

    /**
     * Save new user
     */
    public async createUser(createUserunifier: CreateUserUnifier): Promise<void> {
        await this.dbClient.table('admin_user').insert({
            firstname: createUserunifier.firstname,
            lastname: createUserunifier.lastname,
            username: createUserunifier.username,
            email: createUserunifier.email,
            status: 1,
            password: await bcrypt.hash(createUserunifier.password, 10),
            created_at: new Date(),
            updated_at: new Date(),
        });
    }

    /**
     * Update user
     */
    public async updateUser(createUserunifier: CreateUserUnifier): Promise<AdminUserType> {
        await this.dbClient.table('admin_user')
            .where('id', createUserunifier.userId)
            .update({
                firstname: createUserunifier.firstname,
                lastname: createUserunifier.lastname,
                username: createUserunifier.username,
                email: createUserunifier.email,
                password: await bcrypt.hash(createUserunifier.password, 10),
                updated_at: new Date()
            });
        const user = await this.dbClient.table('admin_user').where('id', createUserunifier.userId).first();
        return {
            id: user.id,
            firstname: user.firstname,
            lastname: user.lastname,
            username: user.username,
            email: user.email,
            status: user.status,
            createdAt: user.created_at
        };
    }

    /**
     * Remove statuses by ids
     */
    public async removeStatusesByIds(ids: string[]): Promise<void> {
        await this.dbClient.table('status_mapping')
            .del()
            .whereIn('id', ids);
    }

    /**
     * Update statuses
     */
    public async updateStatuses(data: any): Promise<void> {
        const queries = new Array();
        await this.dbClient.transaction(async (trx) => {
            for (const status of data) {
                const query = this.dbClient.table('status_mapping')
                    .where('id', status.id)
                    .update({
                        crm_status: status.crm,
                        kaspi_status: status.kaspi,
                        updated_at: new Date()
                    }).transacting(trx); // This makes every update be in the same transaction
                queries.push(query);
            }
            await Promise.all(queries);
            trx.commit();
        });
    }

    /**
     * Save new statuses
     */
    public async saveNewStatuses(data: SaveNewStatuseType[]): Promise<void> {
        await this.dbClient.table('status_mapping').insert(data);
    }

    /**
     * Remove warehouses by ids
     */
    public async removeWarehousesByIds(ids: string[]): Promise<void> {
        await this.dbClient.table('warehouse_mapping')
            .del()
            .whereIn('id', ids);
    }

    /**
     * Update warehouses
     */
    public async updateWarehouses(data: any): Promise<void> {
        const queries = new Array();
        await this.dbClient.transaction(async (trx) => {
            for (const status of data) {
                const query = this.dbClient.table('warehouse_mapping')
                    .where('id', status.id)
                    .update({
                        crm_warehouse: status.crm,
                        kaspi_warehouse: status.kaspi,
                        updated_at: new Date()
                    }).transacting(trx);
                queries.push(query);
            }
            await Promise.all(queries);
            trx.commit();
        });
    }

    /**
     * Save new warehouses
     */
    public async saveNewWarehouses(data: SaveNewWarehouseType[]): Promise<void> {
        await this.dbClient.table('warehouse_mapping').insert(data);
    }

    /**
     * Get data on the number of orders for dashboard
     */
    public async getDataOnTheNumberOfOrders(): Promise<OrdersCountInfoType> {

        const result = await this.dbClient.raw(`
            SELECT 
                COUNT(id) AS allOrders,
                SUM(if(created_at > '${dayjs().format('YYYY-MM-DD')}', 1, 0)) AS today,
                SUM(if(appStatus = '${OrderAppStatusesEnum.completed}', 1, 0)) AS completed,
                SUM(if(appStatus = '${OrderAppStatusesEnum.canceled}', 1, 0)) AS canceled
            FROM orders
        `);

        return result[0][0];
    }

    /**
     * Get all orders by month
     */
    public async getAllOrdersByMonth(currentMonthNumber: number): Promise<number[]> {

        // Get month range
        const monthNumberRange = this.getMonthNumberRange(currentMonthNumber);

        // Generate query
        let query = `SELECT `;
        for (const [key, monthNumber] of Object.entries(monthNumberRange)) {

            if (monthNumber === 12) {
                query += `(SELECT COUNT(*) FROM orders WHERE created_at > '${dayjs().format('YYYY')}-${monthNumber}-01') as '${monthNumber}'`;
            } else {
                query += `(SELECT COUNT(*) FROM orders WHERE created_at > '${dayjs().format('YYYY')}-${monthNumber}-01' AND created_at < '${dayjs().format('YYYY')}-${monthNumber + 1}-01') as '${monthNumber}'`;
            }

            if (Number(key) + 1 !== monthNumberRange.length) {
                query += ', ';
            } else {
                query += ' ';
            }
        }
        query += `FROM orders`;
        // Make request
        const result = await this.dbClient.raw(query);

        const preparedData = new Array();

        for(const [monthNumber, count] of Object.entries(result[0][0])) {
            preparedData.push(count);
        }

        return preparedData;
    }

    /**
     * Get completed orders by month
     */
    public async getCompletedOrdersByMonth(currentMonthNumber: number): Promise<number[]> {

        // Get month range
        const monthNumberRange = this.getMonthNumberRange(currentMonthNumber);

        // Generate query
        let query = `SELECT `;
        for (const [key, monthNumber] of Object.entries(monthNumberRange)) {

            if (monthNumber === 12) {
                query += `(SELECT COUNT(*) FROM orders WHERE created_at > '${dayjs().format('YYYY')}-${monthNumber}-01' AND appStatus = '${OrderAppStatusesEnum.completed}') as '${monthNumber}'`;
            } else {
                query += `(SELECT COUNT(*) FROM orders WHERE created_at > '${dayjs().format('YYYY')}-${monthNumber}-01' AND created_at < '${dayjs().format('YYYY')}-${monthNumber + 1}-01' AND appStatus = '${OrderAppStatusesEnum.completed}') as '${monthNumber}'`;
            }

            if (Number(key) + 1 !== monthNumberRange.length) {
                query += ', ';
            } else {
                query += ' ';
            }
        }
        query += `FROM orders`;
        // Make request
        const result = await this.dbClient.raw(query);

        const preparedData = new Array();

        for(const [monthNumber, count] of Object.entries(result[0][0])) {
            preparedData.push(count);
        }

        return preparedData;
    }

    /**
     * Get canceled orders by month
     */
    public async getCanceledOrdersByMonth(currentMonthNumber: number): Promise<number[]> {

        // Get month range
        const monthNumberRange = this.getMonthNumberRange(currentMonthNumber);

        // Generate query
        let query = `SELECT `;
        for (const [key, monthNumber] of Object.entries(monthNumberRange)) {

            if (monthNumber === 12) {
                query += `(SELECT COUNT(*) FROM orders WHERE created_at > '${dayjs().format('YYYY')}-${monthNumber}-01' AND appStatus = '${OrderAppStatusesEnum.canceled}') as '${monthNumber}'`;
            } else {
                query += `(SELECT COUNT(*) FROM orders WHERE created_at > '${dayjs().format('YYYY')}-${monthNumber}-01' AND created_at < '${dayjs().format('YYYY')}-${monthNumber + 1}-01' AND appStatus = '${OrderAppStatusesEnum.canceled}') as '${monthNumber}'`;
            }

            if (Number(key) + 1 !== monthNumberRange.length) {
                query += ', ';
            } else {
                query += ' ';
            }
        }
        query += `FROM orders`;
        // Make request
        const result = await this.dbClient.raw(query);

        const preparedData = new Array();

        for(const [monthNumber, count] of Object.entries(result[0][0])) {
            preparedData.push(count);
        }

        return preparedData;
    }

    /**
     * Get month number range
     */
    private getMonthNumberRange(currentMonthNumber: number): number[] {
        const range = new Array();
        let firstMonthNumber = 0;

        // Starting in October
        if (currentMonthNumber < 3) {
            firstMonthNumber = 9
        }
        while (firstMonthNumber !== currentMonthNumber) {
            firstMonthNumber += 1;

            if (firstMonthNumber == 13) {
                firstMonthNumber = 1;
            }

            range.push(firstMonthNumber);
        }

        return range;
    }

}
