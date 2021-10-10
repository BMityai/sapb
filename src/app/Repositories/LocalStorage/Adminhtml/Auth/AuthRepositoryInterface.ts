export default interface AuthRepositoryInterface {
    /**
     * Get admin user by login or email
     */
    getAdminUser(login: string);

    /**
     * Get admin user by userId
     */
    getUserById(userId: string);
}
