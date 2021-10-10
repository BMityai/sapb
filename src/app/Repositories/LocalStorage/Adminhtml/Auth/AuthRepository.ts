import AuthRepositoryInterface from './AuthRepositoryInterface';
import LocalStorageRepository from '../../LocalStorageRepository';

export default class AuthRepository extends LocalStorageRepository implements AuthRepositoryInterface {

    /**
     * Get admin user by login or email
     */
    public async getAdminUser(login: string) {
        return await this.dbClient.table('admin_user')
            .where('username', login)
            .orWhere('email', login)
            .first()
    }

    /**
     * Get admin user by userId
     */
    public async getUserById(userId: string) {
        return await this.dbClient.table('admin_user')
            .where('id', userId)
            .first()
    }

}
