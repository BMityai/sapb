import BaseSchema from 'sosise-core/build/Database/BaseSchema';

/**
 * If you need more information, see: http://knexjs.org/#Schema
 */
export default class CreateAdminUserTable extends BaseSchema {

    protected tableName = 'admin_user';

    /**
     * Run the migrations.
     */
    public async up(): Promise<void> {
        await this.dbConnection.schema.createTable(this.tableName, (table) => {
            table.increments('id');
            table.string('firstname').notNullable();
            table.string('lastname').nullable();
            table.string('email').notNullable().unique();
            table.string('username').notNullable().unique();
            table.string('password').notNullable();
            table.boolean('status').notNullable();
            table.timestamps(true);
        });
    }

    /**
     * Reverse the migrations.
     */
    public async down(): Promise<void> {
        await this.dbConnection.schema.dropTable(this.tableName);
    }
}
