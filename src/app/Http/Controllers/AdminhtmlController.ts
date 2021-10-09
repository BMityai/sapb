import { Request, Response, NextFunction } from 'express';
import IOC from 'sosise-core/build/ServiceProviders/IOC';
import AdminhtmlService from '../../Services/AdminhtmlService';
// import AdminUserAuthRequestBodyType from '../../Types/AdminUserAuthRequestBodyType';
import AdminAuthUnifier from '../../Unifiers/Adminhtml/AdminAuthUnifier';
import GetAdminUserByJwtUnifier from '../../Unifiers/Adminhtml/GetAdminUserByJwtUnifier';


export default class AdminhtmlController {

    service: AdminhtmlService;

    // constructor() {
    //     this.service = IOC.make('AdminhtmlService');
    // }

    /**
     * Auth method
     */
    public async auth(request: Request, response: Response, next: NextFunction) {
        // const adminAuthUnifier = new AdminAuthUnifier(request.body);

        // try {
        //     const result = await this.service.auth(new AdminUserAuthRequestBodyType(adminAuthUnifier))
        //     return response.send(result);
        // } catch (error) {
        //     next(error);
        // }
    }

    public async getUserByJwt(request: Request, response: Response, next: NextFunction) {
        // const adminAuthUnifier = new GetAdminUserByJwtUnifier(request.query);
        // try {
        //     const result = await this.service.getUserByJwt(adminAuthUnifier.jwt)
        //     return response.send(result);
        // } catch (error) {
        //     next(error);
        // }
    }
}
