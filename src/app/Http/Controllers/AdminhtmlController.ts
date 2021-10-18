import { Request, Response, NextFunction } from 'express';
import Helper from 'sosise-core/build/Helper/Helper';
import IOC from 'sosise-core/build/ServiceProviders/IOC';
import AuthService from '../../Services/Adminhtml/AuthService';
import StatusMappingService from '../../Services/Adminhtml/StatusMappingService';
import AdminAuthUnifier from '../../Unifiers/Adminhtml/AdminAuthUnifier';
import GetAdminUserByJwtUnifier from '../../Unifiers/Adminhtml/GetAdminUserByJwtUnifier';


export default class AdminhtmlController {

    authService: AuthService;
    statusMappingService: StatusMappingService;

    constructor() {
        this.authService = IOC.make(AuthService);
        this.statusMappingService = IOC.make(StatusMappingService);
    }

    /**
     * Auth method
     */
    public async auth(request: Request, response: Response, next: NextFunction) {
        const adminAuthUnifier = new AdminAuthUnifier(request.body);

        try {
            const result = await this.authService.auth(adminAuthUnifier)
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get admin user by jwt token
     */
    public async getUserByJwt(request: Request, response: Response, next: NextFunction) {
        const getAdminUserByJwtUnifier = new GetAdminUserByJwtUnifier(request.query);
        try {
            const result = await this.authService.getUserByJwt(getAdminUserByJwtUnifier.token)
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get statuses
     */
    public async getStatuses(request: Request, response: Response, next: NextFunction) {
        try {
            const result = await this.statusMappingService.getStatuses();
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Save statuses
     */
    public async saveStatuses(request: Request, response: Response, next: NextFunction) {
        Helper.dump(request.body)
        // try {
            const result = await this.statusMappingService.getStatuses();
            return response.send(result);
        // } catch (error) {
        //     next(error);
        // }
    }
}
