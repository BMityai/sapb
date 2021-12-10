import { isNull } from "lodash";
import IOC from "sosise-core/build/ServiceProviders/IOC";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import storesConfig from "../../config/stores";
import KaspiOrderStatusesEnum from "../Enums/KaspiOrderStatusesEnum";
import OrderAppStatusesEnum from "../Enums/OrderAppStatusesEnum";
import KaspiBankApiRepositoryInterface from "../Repositories/KaspiBank/KaspiBankApiRepositoryInterface";
import LocalStorageRepositoryInterface from "../Repositories/LocalStorage/LocalStorageRepositoryInterface";
import RetailCrmApiRepositoryInterface from "../Repositories/RetailCrm/RetailCrmApiRepositoryInterface";
import OrderForSetWayBillLinkType from "../Types/Kaspi/OrderForSetWayBillLinkType";
import ReturnRequestedOrReturnedOrderType from "../Types/Kaspi/ReturnRequestedOrReturnedOrderType";
import UnfinishedOrdersType from "../Types/Kaspi/UnfinishedOrdersType";


export default class GetChangesFromKaspiService {

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
        retailCrmApiRepository: RetailCrmApiRepositoryInterface
    ) {
        this.localStorageRepository = localStorageRepository;
        this.kaspiBankApiRepository = kaspiBankApiRepository;
        this.retailCrmApiRepository = retailCrmApiRepository;
        this.logger = IOC.make(LoggerService) as LoggerService;

    }

    /**
     * Get changes from kaspi and update
     */
    public async execute() {
        // Logger
        this.logger.info('[GET CHANGES FROM KASPI] Start');

        // Check UNFINISHED orders
        await this.checkChangesForUnfinishedOrders();

        // Check FINISHED orders (set returned after completed)
        await this.checkChangesForFinishedOrders();

        // Get KASPI DELIVERY orders way bill link
        await this.getWayBillLink();

        // Logger
        this.logger.info('[GET CHANGES FROM KASPI] Finish');
    }

    /**
     * Get changes for finished orders
     */
    protected async checkChangesForFinishedOrders(): Promise<void> {

        // Logger
        this.logger.info('[GET CHANGES FROM KASPI] Starting to sync the statuses of FINISHED orders');

        // Get returnRequested and returned orders from kaspi
        const ordersFromKaspi = await this.getReturnRequestedAndReturnedOrders();

        // Exclude not changed orders, get only changed orders
        const ordersForChange = await this.addLocalOrderProperties(ordersFromKaspi);

        // Sync with crm
        const response = await this.SyncUpdatedStatusesWithCrm(ordersForChange);

        await this.updateOrdersInLocalStorage(response);
    }

    /**
     * Get changes for unfinished orders
     */
    protected async checkChangesForUnfinishedOrders(): Promise<void> {

        // Logger
        this.logger.info('[GET CHANGES FROM KASPI] Starting to sync the statuses of UNFINISHED orders');

        // Get unfinished orders
        const unfinishedOrders = await this.localStorageRepository.getUnfinishedOrders();

        // Get orders statuses from kaspi by kaspiId
        const orderStatusesFromKaspi = await this.getOrderStatusesFromKaspiByKaspiId(unfinishedOrders);

        // Exclude not changed orders, get only changed orders
        const changedOrders = await this.excludeUnchangedOrders(orderStatusesFromKaspi, unfinishedOrders);

        // Sync with crm
        const response = await this.SyncUpdatedStatusesWithCrm(changedOrders);

        await this.updateOrdersInLocalStorage(response);
    }

    /**
     * Get waybill links from kaspi
     */
    protected async getWayBillLink(): Promise<void> {
        // Log
        this.logger.info('[GET CHANGES FROM KASPI] Get waybill link');

        // get orders without waybill links
        const ordersWithoutWayBillLink = await this.localStorageRepository.getWithoutWayBillLinkOrders();

        // Set waybill links from kaspi
        const orders = await this.getWayBillLinksFromKaspi(ordersWithoutWayBillLink);

        // Set waybill links to crmOrder
        await this.setWayBillLinksToCrmOrder(orders);
    }

    /**
     * Exclude unchanged orders
     */
    private async excludeUnchangedOrders(orderStatusesFromKaspi: PromiseSettledResult<any>[], unfinishedOrders: UnfinishedOrdersType[]): Promise<UnfinishedOrdersType[]> {

        const changedOrders = new Array();

        for (const [key, unfinishedOrder] of Object.entries(unfinishedOrders)) {

            const orderStatusFromKaspi = orderStatusesFromKaspi[key];

            // Cut off rejected requests
            if (orderStatusesFromKaspi[key].status === 'rejected') {
                // Logger
                this.logger.error(`[GET CHANGES FROM KASPI] Error when receiving order ${unfinishedOrder.orderNumber} from kaspi`, orderStatusFromKaspi.reason);

                // Add process to db
                await this.localStorageRepository.log(unfinishedOrder.id, 'error', `[GET CHANGES FROM KASPI] Error when receiving order from kaspi, ${JSON.stringify(orderStatusFromKaspi.reason)}`);
                continue;
            }

            // Check is change
            if (unfinishedOrder.kaspiStatus === orderStatusFromKaspi.value.status) {
                continue;
            }

            // Add process to db
            await this.localStorageRepository.log(unfinishedOrder.id, 'info', `[GET CHANGES FROM KASPI] Detected a change order status in the KASPI. The status will change from "${unfinishedOrder.kaspiStatus}" to "${orderStatusFromKaspi.value.status}"`);

            // Set new kaspi status
            unfinishedOrder.kaspiStatus = orderStatusFromKaspi.value.status;

            // Set new kaspi state
            unfinishedOrder.kaspiState = orderStatusFromKaspi.value.state;

            // Set new kaspi status
            unfinishedOrder.crmStatus = await this.localStorageRepository.getOrderCrmStatusByKaspiStatus(orderStatusFromKaspi.value.status);

            changedOrders.push(unfinishedOrder);
        }

        // Log
        this.logger.info(`[GET CHANGES FROM KASPI] Found ${changedOrders.length} orders with updated statuses`, changedOrders);

        return changedOrders;
    }

    /**
     * Get order statuses from kaspi
     */
    private async getOrderStatusesFromKaspiByKaspiId(unfinishedOrders: UnfinishedOrdersType[]): Promise<PromiseSettledResult<any>[]> {
        // Init promise list for 'get order statuses from kaspi'
        const getOrderStatusByKaspiIdPromises = new Array();

        for (const order of unfinishedOrders) {
            // Add 'get order statuses from kaspi' to promise list
            getOrderStatusByKaspiIdPromises.push(this.kaspiBankApiRepository.getOrderStatusByKaspiId(order.kaspiId, order.site));
        }

        // Return order statuses from kaspi by kaspiId
        return await Promise.allSettled(getOrderStatusByKaspiIdPromises);
    }

    /**
     * Syn changes with crm
     */
    private async SyncUpdatedStatusesWithCrm(changedOrders: UnfinishedOrdersType[]): Promise<PromiseSettledResult<any>[]> {
        // Logger
        this.logger.info(`[GET CHANGES FROM KASPI] Sync updated statuses with crm`);

        const syncPromises = new Array();

        for (const order of changedOrders) {

            // Check is change
            if (isNull(order.crmStatus)) {
                continue;
            }

            // If canceled
            if (order.kaspiStatus === KaspiOrderStatusesEnum.canceled) {
                order.appStatus = OrderAppStatusesEnum.canceled;
            }

            // If completed
            if (order.kaspiStatus === KaspiOrderStatusesEnum.completed) {
                order.appStatus = OrderAppStatusesEnum.completed;
            }

            // If returned
            if (order.kaspiStatus === KaspiOrderStatusesEnum.returnRequested || order.kaspiStatus === KaspiOrderStatusesEnum.returned) {
                order.appStatus = OrderAppStatusesEnum.returned;
            }

            syncPromises.push(this.retailCrmApiRepository.changeOrderStatus(order));
        }

        // Run all promises
        return await Promise.allSettled(syncPromises);
    }

    /**
     * Update order in local storage
     */
    private async updateOrdersInLocalStorage(response: PromiseSettledResult<any>[]): Promise<void> {
        const updateStatusesPromise = new Array();
        for (const result of response) {
            if (result.status === 'rejected') {
                // Logger
                this.logger.error(`[GET CHANGES FROM KASPI] Error when sync from kaspi`, result.reason);
                await this.localStorageRepository.log(result.reason.params.orderId, 'error', `[GET CHANGES FROM KASPI] Error when sync from kaspi. Response: ${JSON.stringify(result.reason.response)}`);
                continue;
            }

            // Log
            this.logger.info(`[GET CHANGES FROM KASPI] Order status has been successfully updated in crm`, result.value);
            updateStatusesPromise.push(this.localStorageRepository.log(result.value.id, 'info', `[GET CHANGES FROM KASPI] Order status has been successfully updated to "${result.value.crmStatus}" in crm.`));

            // Update status in db
            updateStatusesPromise.push(this.localStorageRepository.updateOrderStatuses({
                id: result.value.id,
                appStatus: result.value.appStatus,
                kaspiStatus: result.value.kaspiStatus,
                crmStatus: result.value.crmStatus,
                kaspiState: result.value.kaspiState
            }));
        }

        // Logger
        this.logger.info(`[GET CHANGES FROM KASPI] Update local orders`);
    }

    /**
     * Prepare return & return requested orders
     */
    private async getReturnRequestedAndReturnedOrders(): Promise<ReturnRequestedOrReturnedOrderType[]> {

        // Logger
        this.logger.info('[GET CHANGES FROM KASPI] Get returned and return requested orders from kaspi');

        // Get stores list
        const stores = storesConfig.stores;

        // Promises
        const promises = new Array();

        // Get new orders for all stores
        for (const [store, site] of Object.entries(stores)) {

            // Get return requested orders
            // promises.push(this.kaspiBankApiRepository.getReturnRequestedOrdersPerStore(store));

            // Get returned orders
            promises.push(this.kaspiBankApiRepository.getReturnedOrdersPerStore(site));
        }

        // Run all promises
        const result = await Promise.allSettled(promises);

        // Filter only fultilled response
        const fulfilledOrders = result.map((orders) => {
            if (orders.status === 'fulfilled') {
                return orders.value;
            }
        });

        return fulfilledOrders.flat();
    }

    /**
     * Prepare orders (add local order properties)
     */
    private async addLocalOrderProperties(ordersFromKaspi: ReturnRequestedOrReturnedOrderType[]): Promise<UnfinishedOrdersType[]> {

        const preparedOrders = new Array();
        // prepare order
        for (const orderFromKaspi of ordersFromKaspi) {

            // Get local order
            const localOrder = await this.localStorageRepository.getOrderByKaspiId(orderFromKaspi.kaspiId);

            // filter unchanged and empty orders
            if (isNull(localOrder) || orderFromKaspi.kaspiStatus === localOrder.kaspiOrderStatus || localOrder.kaspiOrderStatus !== KaspiOrderStatusesEnum.completed) {
                continue;
            }

            // Typecast
            const typedorder: UnfinishedOrdersType = {
                id: localOrder.id,
                crmId: localOrder.crmId,
                appStatus: OrderAppStatusesEnum.returned,
                kaspiStatus: orderFromKaspi.kaspiStatus,
                crmStatus: await this.localStorageRepository.getOrderCrmStatusByKaspiStatus(orderFromKaspi.kaspiStatus),
                site: localOrder.site,
                orderNumber: localOrder.orderNumber,
                kaspiId: orderFromKaspi.kaspiId,
                kaspiState: orderFromKaspi.kaspiState
            };

            preparedOrders.push(typedorder);

            // Log
            this.logger.info(`[GET CHANGES FROM KASPI] Detected a change ${localOrder.orderNumber} order status in the KASPI. The status will change from "${localOrder.kaspiOrderStatus}" to "${orderFromKaspi.kaspiStatus}"`);
            await this.localStorageRepository.log(localOrder.id, 'info', `[GET CHANGES FROM KASPI] Detected a change order status in the KASPI. The status will change from "${localOrder.kaspiOrderStatus}" to "${orderFromKaspi.kaspiStatus}"`);
        }

        return preparedOrders;
    }

    /**
     * Get waybill link from kaspi
     */
    private async getWayBillLinksFromKaspi(ordersWithoutWayBillLink: OrderForSetWayBillLinkType[]): Promise<OrderForSetWayBillLinkType[]> {

        // Get waybill links from kaspi
        const getWayBillLiksFromKaspiPromise = new Array();

        for (const orderWithoutWayBillLink of ordersWithoutWayBillLink) {

            // Get per order waybill link
            getWayBillLiksFromKaspiPromise.push(this.kaspiBankApiRepository.getWaybillLinkByKaspiId(orderWithoutWayBillLink.kaspiId, orderWithoutWayBillLink.site));
        }

        // Run getWayBillLiksFromKaspiPromise promise
        const wayBillLinks = await Promise.allSettled(getWayBillLiksFromKaspiPromise);

        const result = new Array();
        for (const [key, waybillLink] of Object.entries(wayBillLinks)) {
            if (waybillLink.status === 'fulfilled' && !isNull(waybillLink.value)) {
                const orderWithoutWayBillLink = ordersWithoutWayBillLink[key];

                // Set waybill link per order
                orderWithoutWayBillLink.wayBillLink = waybillLink.value;

                result.push(orderWithoutWayBillLink);

                // Log
                this.logger.info(`[GET CHANGES FROM KASPI] Detected waybil link "${orderWithoutWayBillLink.wayBillLink}" for order ${orderWithoutWayBillLink.orderNumber}`);
                await this.localStorageRepository.log(orderWithoutWayBillLink.id, 'info', `[GET CHANGES FROM KASPI] Detected waybil link "${orderWithoutWayBillLink.wayBillLink}"`);
            }
        }
        return result;
    }

    /**
     * Set waybill links to crmOrder
     */
    private async setWayBillLinksToCrmOrder(orders: OrderForSetWayBillLinkType[]): Promise<void> {
        const promises = new Array();

        for (const order of orders) {
            promises.push(this.retailCrmApiRepository.setWayBillLink(order));
        }

        const response = await Promise.allSettled(promises);

        for(const result of response) {
            if(result.status === 'rejected') {

                // Log
                this.logger.error(`[GET CHANGES FROM KASPI] There was an error installing waybill link`, result.reason);
                await this.localStorageRepository.log(result.reason.params.orderId, 'error', `[GET CHANGES FROM KASPI] There was an error installing waybill link. Response: ${JSON.stringify(result.reason.response)}`);

                continue;
            }

            // Set to local order
            await this.localStorageRepository.setWayBillLink(result.value);

            // Log
            this.logger.info(`[GET CHANGES FROM KASPI] Waybill link "${result.value.wayBillLink}" installed successfully to order ${result.value.orderNumber}`);
            await this.localStorageRepository.log(result.value.id, 'info', `[GET CHANGES FROM KASPI] waybill link installed successfully`);
        }
    }
}
