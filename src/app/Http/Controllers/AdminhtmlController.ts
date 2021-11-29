import { Request, Response, NextFunction } from 'express';
import Helper from 'sosise-core/build/Helper/Helper';
import IOC from 'sosise-core/build/ServiceProviders/IOC';
import AdminUserService from '../../Services/Adminhtml/AdminUserService';
import AuthService from '../../Services/Adminhtml/AuthService';
import DashboardService from '../../Services/Adminhtml/DashboardService';
import StatusMappingService from '../../Services/Adminhtml/StatusMappingService';
import AdminAuthUnifier from '../../Unifiers/Adminhtml/AdminAuthUnifier';
import GetAdminUserByJwtUnifier from '../../Unifiers/Adminhtml/GetAdminUserByJwtUnifier';


export default class AdminhtmlController {

    authService: AuthService;
    statusMappingService: StatusMappingService;
    dashboardService: DashboardService;
    adminUserService: AdminUserService;

    constructor() {
        this.authService = IOC.make(AuthService);
        this.statusMappingService = IOC.make(StatusMappingService);
        this.dashboardService = IOC.make(DashboardService);
        this.adminUserService = IOC.make(AdminUserService);
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
        try {
            const result = await this.statusMappingService.getStatuses();
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get warehouses
     */
    public async getWarehouses(request: Request, response: Response, next: NextFunction) {
        try {
            const result = await this.statusMappingService.getStatuses();
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Save warehouses
     */
    public async saveWarehouses(request: Request, response: Response, next: NextFunction) {
        Helper.dump(request.body)
        try {
            const result = await this.statusMappingService.getStatuses();
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get all orders info for dashboard task-boxes
     */
    public async getAllOrdersInfo(request: Request, response: Response, next: NextFunction) {
        try {
            const result = await this.dashboardService.getAllOrdersInfo();
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get data on orders for the last year for dashboard chart
     */
    public async getOrdersInfoForTheLastYear(request: Request, response: Response, next: NextFunction) {
        try {
            const result = await this.dashboardService.getOrdersInfoForTheLastYear();
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get orders for dashboard table
     */
    public async getOrders(request: Request, response: Response, next: NextFunction) {
        try {
            const result = await this.dashboardService.getOrders();
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Get users
     */
    public async getUsers(request: Request, response: Response, next: NextFunction) {
        try {
            const result = await this.adminUserService.getUsers();
            return response.send(result);
        } catch (error) {
            next(error);
        }
    }
}
