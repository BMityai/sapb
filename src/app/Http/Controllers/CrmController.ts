import { Request, Response, NextFunction } from 'express';
import Helper from 'sosise-core/build/Helper/Helper';
import IOC from 'sosise-core/build/ServiceProviders/IOC';
import HttpResponse from 'sosise-core/build/Types/HttpResponse';
import ChangeOrderStatusFromCrmService from '../../Services/ChangeOrderStatusFromCrmService';
import PartialCancellationService from '../../Services/PartialCancellationService';
import ChangeOrderStatusUnifier from '../../Unifiers/ChangeOrderStatusUnifier';
import OrderPartialCancellationUnifier from '../../Unifiers/OrderPartialCancellationUnifier';

export default class CrmController {
    /**
     * Change status
     */
    public async changeStatus(request: Request, response: Response, next: NextFunction) {

        const changeOrderStatusUnifier = new ChangeOrderStatusUnifier(request.body);
        const service = IOC.make(ChangeOrderStatusFromCrmService) as ChangeOrderStatusFromCrmService;

        // Handle request
        await service.handle(changeOrderStatusUnifier);

        try {
            // Prepare http response
            const httpResponse: HttpResponse = {
                code: 1000,
                message: 'Success',
                data: null
            };

            // Send response
            return response.send(httpResponse);
        } catch (error) {
            next(error);
        }
    }

    /**
     * Cancel part of order
     */
    public async cancelPartOfTheOrder(request: Request, response: Response, next: NextFunction) {

        const partialCancellationUnifier = new OrderPartialCancellationUnifier(request.body);
        const service = IOC.make(PartialCancellationService) as PartialCancellationService;

        // Handle request
        await service.handle(partialCancellationUnifier);

        try {
            // Prepare http response
            const httpResponse: HttpResponse = {
                code: 1000,
                message: 'Success',
                data: null
            };

            // Send response
            return response.send(httpResponse);
        } catch (error) {
            next(error);
        }
    }


}
