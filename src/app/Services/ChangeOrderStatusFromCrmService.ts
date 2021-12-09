import { isNull } from "lodash";
import IOC from "sosise-core/build/ServiceProviders/IOC";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import KaspiOrderStatesEnum from "../Enums/KaspiOrderStatesEnum";
import KaspiOrderStatusesEnum from "../Enums/KaspiOrderStatusesEnum";
import OrderAppStatusesEnum from "../Enums/OrderAppStatusesEnum";
import CantChangeStatusException from "../Exceptions/CantChangeStatusException";
import MatchingKaspiStatusNotFoundException from "../Exceptions/MatchingKaspiStatusNotFoundException";
import OrderNotFoundException from "../Exceptions/OrderNotFoundException";
import KaspiBankApiRepositoryInterface from "../Repositories/KaspiBank/KaspiBankApiRepositoryInterface";
import LocalStorageRepositoryInterface from "../Repositories/LocalStorage/LocalStorageRepositoryInterface";
import RetailCrmApiRepositoryInterface from "../Repositories/RetailCrm/RetailCrmApiRepositoryInterface";
import OrderForChangeStatusType from "../Types/Crm/OrderForChangeStatusType";
import ChangeOrderStatusUnifier from "../Unifiers/ChangeOrderStatusUnifier";

export default class ChangeOrderStatusFromCrmService {

    protected localStorageRepository: LocalStorageRepositoryInterface;
    protected kaspiBankApiRepository: KaspiBankApiRepositoryInterface;
    protected retailCrmApiRepository: RetailCrmApiRepositoryInterface;
    protected logger: LoggerService;

    /**
     * Constructor
     */
    constructor(
        localStorageRepository: LocalStorageRepositoryInterface,
        kaspiBankApiRepository: KaspiBankApiRepositoryInterface,
        retailCrmApiRepository: RetailCrmApiRepositoryInterface,
    ) {
        this.localStorageRepository = localStorageRepository;
        this.kaspiBankApiRepository = kaspiBankApiRepository;
        this.retailCrmApiRepository = retailCrmApiRepository;
        this.logger = IOC.make(LoggerService) as LoggerService;
    }

    public async handle(changeOrderStatusUnifier: ChangeOrderStatusUnifier) {

        // Log
        this.logger.info(`[CHANGE ORDER STATUS FROM CRM] Received a request from crm to change the order "${changeOrderStatusUnifier.orderNumber}" status to "${changeOrderStatusUnifier.status}"`);

        // Get kaspi status from mapping table
        const convertedKaspiStatus = await this.convertCrmStatusToKaspiStatus(changeOrderStatusUnifier.status);

        // Get actually order from kaspi and sync
        const localOrder = await this.getActuallyOrderAndSync(changeOrderStatusUnifier);

        // Check can change order status
        const canChange = await this.checkCanChangeStatus(convertedKaspiStatus, localOrder);

        if (!canChange) {
            // @todo НУЖНО ОТПРАВИТЬ ПОДТВЕРЖДЕНИЕ В CRM
            throw new CantChangeStatusException('Unable to change order status');
        }

        // Convert order
        const convertedOrder = this.convertOrder(convertedKaspiStatus, changeOrderStatusUnifier.status, localOrder);

        // Update order (local & kaspi) statuses
        await this.updateOrderStatuses(convertedOrder);
    }

    /**
     * Update order (local and crm)
     */
    protected async getActuallyOrderAndSync(changeOrderStatusUnifier: ChangeOrderStatusUnifier): Promise<OrderForChangeStatusType> {
        // Get local order
        const localOrder = await this.getLocalOrder(changeOrderStatusUnifier.orderNumber);

        // Log
        this.logger.info(`[CHANGE ORDER STATUS FROM CRM] Get order "${changeOrderStatusUnifier.orderNumber}" from kaspi for update local and crm order`);
        await this.localStorageRepository.log(localOrder.id, 'info', `[CHANGE ORDER STATUS FROM CRM] Received a request from crm to change the order status to "${changeOrderStatusUnifier.status}"`);

        const kaspiOrderinfo = await this.kaspiBankApiRepository.getOrderStatusByKaspiId(localOrder.kaspiId, localOrder.site);

        if (kaspiOrderinfo.status === localOrder.kaspiOrderStatus) {
            // Log
            this.logger.info(`[CHANGE ORDER STATUS FROM CRM] The order is valid. No update required`);
            return localOrder;
        }

        localOrder.kaspiOrderStatus = kaspiOrderinfo.status;
        localOrder.kaspiState = kaspiOrderinfo.state;
        localOrder.crmOrderStatus = await this.localStorageRepository.getOrderCrmStatusByKaspiStatus(kaspiOrderinfo.status) as string;

        await this.SyncUpdatedStatuseWithCrm(localOrder);

        await this.updateOrderInLocalStorage(localOrder);

        return localOrder;
    }

    /**
     * Convert crm status to kaspi status
     */
    private async convertCrmStatusToKaspiStatus(crmStatus: string): Promise<string> {

        // Get kaspi status from mapping table
        const kaspiStatus = await this.localStorageRepository.getOrderKaspiStatusByCrmStatus(crmStatus);

        if (!isNull(kaspiStatus)) {
            return kaspiStatus;
        }

        throw new MatchingKaspiStatusNotFoundException('Kaspi status not found');
    }

    /**
     * Syn changes with crm
     */
    private async SyncUpdatedStatuseWithCrm(order: OrderForChangeStatusType): Promise<void> {
        // If canceled
        if (order.kaspiOrderStatus === KaspiOrderStatusesEnum.canceled) {
            order.appStatus = OrderAppStatusesEnum.canceled;
        }

        // If completed
        if (order.kaspiOrderStatus === KaspiOrderStatusesEnum.completed) {
            order.appStatus = OrderAppStatusesEnum.completed;
        }

        // If returned
        if (order.kaspiOrderStatus === KaspiOrderStatusesEnum.returnRequested || order.kaspiOrderStatus === KaspiOrderStatusesEnum.returned) {
            order.appStatus = OrderAppStatusesEnum.returned;
        }


        await this.retailCrmApiRepository.changeOrderStatus({
            id: order.id,
            crmId: order.crmId,
            appStatus: order.appStatus,
            kaspiStatus: order.kaspiOrderStatus,
            crmStatus: order.crmOrderStatus,
            site: order.site,
            orderNumber: order.orderNumber,
            kaspiId: order.kaspiId,
            kaspiState: order.kaspiState
        });

        // Logger
        this.logger.info(`[CHANGE ORDER STATUS FROM CRM] Update order in crm with kaspi order`, order);
    }

    /**
     * Update order in local storage
     */
    private async updateOrderInLocalStorage(order: OrderForChangeStatusType): Promise<void> {
        const updateStatusesPromise = new Array();
        // Log
        this.logger.info(`[CHANGE ORDER STATUS FROM CRM] Order status has been successfully updated in crm`, order);
        updateStatusesPromise.push(this.localStorageRepository.log(order.id, 'info', `[CHANGE ORDER STATUS FROM CRM] Order status has been successfully updated to "${order.crmOrderStatus}" in crm.`));

        // Update status in db
        updateStatusesPromise.push(this.localStorageRepository.updateOrderStatuses({
            id: order.id,
            appStatus: order.appStatus,
            kaspiStatus: order.kaspiOrderStatus,
            crmStatus: order.crmOrderStatus,
            kaspiState: order.kaspiState
        }));

        // Run all promises
        await Promise.allSettled(updateStatusesPromise);
    }

    /**
     * Get local order
     */
    private async getLocalOrder(orderNumber: string): Promise<OrderForChangeStatusType> {

        // Get order by number
        const order = await this.localStorageRepository.getOrderByNumber(orderNumber);

        if (!isNull(order)) {
            return order;
        }
        throw new OrderNotFoundException();
    }

    /**
     * Checking for the possibility of changing status
     */
    private async checkCanChangeStatus(
        convertedKaspiStatus: string,
        orderFromLocalDb: OrderForChangeStatusType
    ): Promise<boolean> {

        // Can cancel order?
        if (convertedKaspiStatus === KaspiOrderStatusesEnum.canceled || convertedKaspiStatus === KaspiOrderStatusesEnum.canceling) {
            if (orderFromLocalDb.kaspiOrderStatus === KaspiOrderStatusesEnum.canceled || orderFromLocalDb.kaspiOrderStatus === KaspiOrderStatusesEnum.completed || orderFromLocalDb.kaspiOrderStatus === KaspiOrderStatusesEnum.canceling) {
                // Log
                this.logger.info(`[CHANGE ORDER STATUS FROM CRM] It is impossible to change the order status to "${convertedKaspiStatus}", beacause order already canceled`, orderFromLocalDb);
                await this.localStorageRepository.log(orderFromLocalDb.id, 'info', `[CHANGE ORDER STATUS FROM CRM] It is impossible to change the order status, beacause order already canceled`);

                return false;
            }
            return true;
        }

        // Can complete order?
        if (convertedKaspiStatus === KaspiOrderStatusesEnum.completed) {

            if (orderFromLocalDb.kaspiOrderStatus === KaspiOrderStatusesEnum.canceled || orderFromLocalDb.kaspiOrderStatus === KaspiOrderStatusesEnum.completed) {
                // Log
                this.logger.info(`[CHANGE ORDER STATUS FROM CRM] It is impossible to change the order status to "${convertedKaspiStatus}", beacause order status "${orderFromLocalDb.kaspiOrderStatus}"`, orderFromLocalDb);
                await this.localStorageRepository.log(orderFromLocalDb.id, 'info', `[CHANGE ORDER STATUS FROM CRM] It is impossible to change the order status to "${convertedKaspiStatus}", beacause order status is: "${orderFromLocalDb.kaspiOrderStatus}"`);

                return false;
            }

            return true;
        }

        // Can accepted order?
        if (convertedKaspiStatus === KaspiOrderStatusesEnum.accepted) {

            if (orderFromLocalDb.kaspiOrderStatus !== KaspiOrderStatusesEnum.approved) {
                // Log
                this.logger.info(`[CHANGE ORDER STATUS FROM CRM] It is impossible to change the order status to "${convertedKaspiStatus}", beacause order status IS NOT "${KaspiOrderStatusesEnum.approved}"`, orderFromLocalDb);
                await this.localStorageRepository.log(orderFromLocalDb.id, 'info', `[CHANGE ORDER STATUS FROM CRM] It is impossible to change the order status to "${convertedKaspiStatus}", beacause order status IS NOT "${KaspiOrderStatusesEnum.approved}"`);

                return false;
            }

            return true;
        }

        // Can returned order?
        if (convertedKaspiStatus === KaspiOrderStatusesEnum.returned || convertedKaspiStatus === KaspiOrderStatusesEnum.returnRequested) {
            if (orderFromLocalDb.kaspiOrderStatus !== KaspiOrderStatusesEnum.completed) {
                // Log
                this.logger.info(`[CHANGE ORDER STATUS FROM CRM] It is impossible to change the order status to "${convertedKaspiStatus}", beacause order status IS NOT "${KaspiOrderStatusesEnum.completed}"`, orderFromLocalDb);
                await this.localStorageRepository.log(orderFromLocalDb.id, 'info', `[CHANGE ORDER STATUS FROM CRM] It is impossible to change the order status to "${convertedKaspiStatus}", beacause order status IS NOT "${KaspiOrderStatusesEnum.completed}"`);

                return false;
            }
            return true;
        }

        // Can change status to "arrived"?
        if (convertedKaspiStatus === KaspiOrderStatusesEnum.arrived) {
            if (orderFromLocalDb.kaspiOrderStatus !== KaspiOrderStatusesEnum.completed) {
                // Log
                this.logger.info(`[CHANGE ORDER STATUS FROM CRM] It is impossible to change the order status to "${convertedKaspiStatus}", beacause order status IS NOT "${KaspiOrderStatusesEnum.completed}"`, orderFromLocalDb);
                await this.localStorageRepository.log(orderFromLocalDb.id, 'info', `[CHANGE ORDER STATUS FROM CRM] It is impossible to change the order status to "${convertedKaspiStatus}", beacause order status IS NOT "${KaspiOrderStatusesEnum.completed}"`);

                return false;
            }
            return true;
        }

        return false;
    }

    /**
     * Change order statuses in all repo
     */
    protected async updateOrderStatuses(convertedOrder: OrderForChangeStatusType): Promise<void> {

        try {
            // Update order status in kaspi
            // await this.kaspiBankApiRepository.changeOrderStatus(convertedOrder); @todo uncomment

            // Change statuses in to db
            await this.localStorageRepository.changeOrderStatuses(convertedOrder);

                // Log
            this.logger.info(`[CHANGE ORDER STATUS FROM CRM] Order "${convertedOrder.orderNumber}" status successfully changed to "${convertedOrder.kaspiOrderStatus}"`);
            await this.localStorageRepository.log(convertedOrder.id, 'info', `[CHANGE ORDER STATUS FROM CRM] Order status successfully changed to "${convertedOrder.kaspiOrderStatus}"`);

        } catch (error) {

                // Log
                this.logger.error(`[CHANGE ORDER STATUS FROM CRM] An error occurred while changing the status`, error);
                await this.localStorageRepository.log(convertedOrder.id, 'error', `[CHANGE ORDER STATUS FROM CRM] Order status successfully changed to "${convertedOrder.kaspiOrderStatus}"`);
        }
    }

    /**
     * Convert order statuses
     */
    private convertOrder(convertedKaspiStatus: string, crmStatus: string, orderFromLocalDb: OrderForChangeStatusType): OrderForChangeStatusType {
        orderFromLocalDb.crmOrderStatus = crmStatus;
        orderFromLocalDb.kaspiOrderStatus = convertedKaspiStatus;
        orderFromLocalDb.appStatus = OrderAppStatusesEnum.processing;

        switch (convertedKaspiStatus) {
            case KaspiOrderStatusesEnum.canceled:
            case KaspiOrderStatusesEnum.canceling:
                orderFromLocalDb.appStatus = OrderAppStatusesEnum.canceled;
                orderFromLocalDb.kaspiState = KaspiOrderStatesEnum.archive;
                break;
            case KaspiOrderStatusesEnum.completed:
                orderFromLocalDb.appStatus = OrderAppStatusesEnum.completed;
                orderFromLocalDb.kaspiState = KaspiOrderStatesEnum.archive;
                break;
            case KaspiOrderStatusesEnum.returned:
            case KaspiOrderStatusesEnum.returnRequested:
                orderFromLocalDb.appStatus = OrderAppStatusesEnum.returned;
                orderFromLocalDb.kaspiState = KaspiOrderStatesEnum.archive;
                break;
        }

        return orderFromLocalDb;
    }
}
