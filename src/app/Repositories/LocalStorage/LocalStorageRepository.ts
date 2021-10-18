import Database from 'sosise-core/build/Database/Database';
import LocalStorageRepositoryInterface from './LocalStorageRepositoryInterface';
import { Knex } from 'knex';
import StatusMappingType from '../../Types/StatusMappingType';

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

}
