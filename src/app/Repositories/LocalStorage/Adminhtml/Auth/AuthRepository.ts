import AuthRepositoryInterface from './AuthRepositoryInterface';
import LocalStorageRepository from '../LocalStorageRepository';
import AdminUserType from '../../../../Types/AdminUserType';

export default class AuthRepository extends LocalStorageRepository implements AuthRepositoryInterface {

    /**
     * Get admin user by login or email
     */
    public async getAdminUser(login: string) {
        return await this.dbClient.table('admin_user')
            .where('status', 1)
            .where(function () {
                this.where('username', login)
                    .orWhere('email', login);
            })
            .first();
    }

    /**
     * Get admin user by userId
     */
    public async getUserById(userId: string): Promise<AdminUserType> {
        const user = await this.dbClient.table('admin_user')
            .where('id', userId)
            .first();

        // typecast
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

}
