import { Request, Response, NextFunction } from 'express';
import Helper from 'sosise-core/build/Helper/Helper';
import IOC from 'sosise-core/build/ServiceProviders/IOC';
import AuthService from '../../Services/Adminhtml/AuthService';
// import AdminUserAuthRequestBodyType from '../../Types/AdminUserAuthRequestBodyType';
import AdminAuthUnifier from '../../Unifiers/Adminhtml/AdminAuthUnifier';
import GetAdminUserByJwtUnifier from '../../Unifiers/Adminhtml/GetAdminUserByJwtUnifier';


export default class AdminhtmlController {

    service: AuthService;

    constructor() {
        this.service = IOC.make(AuthService);
    }

    /**
     * Auth method
     */
    public async auth(request: Request, response: Response, next: NextFunction) {
        const adminAuthUnifier = new AdminAuthUnifier(request.body);

        try {
            const result = await this.service.auth(adminAuthUnifier)
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get admin user by jwt token
     */
    public async getUserByJwt(request: Request, response: Response, next: NextFunction) {
        const adminAuthUnifier = new GetAdminUserByJwtUnifier(request.query);
        try {
            const result = await this.service.getUserByJwt(adminAuthUnifier.token)
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }
}
