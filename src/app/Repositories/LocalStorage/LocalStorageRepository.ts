import Database from 'sosise-core/build/Database/Database';
import LocalStorageRepositoryInterface from './LocalStorageRepositoryInterface';
import { Knex } from 'knex';
import StatusMappingType from '../../Types/StatusMappingType';
import Helper from 'sosise-core/build/Helper/Helper';
import AdminUserType from '../../Types/AdminUserType';

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
     * 
     * @returns 
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
     * Get users
     */
    public async getUsers(): Promise<AdminUserType[]> {
        const users = await this.dbClient.table('admin_user').orderBy('id');
        const preparedData = new Array();
        for(const user of users) {
            preparedData.push({
                id: user.id,
                firstname: user.firstname,
                lastname: user.lastname,
                email: user.email,
                status: user.email,
                createdAt: user.email,
            });
        }

        return preparedData;
    }

}
