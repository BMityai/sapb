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
            createdAt:user.created_at
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

}
