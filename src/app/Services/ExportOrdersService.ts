import IOC from "sosise-core/build/ServiceProviders/IOC";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import NoNewOrdersException from "../Exceptions/NoNewOrdersException";
import LocalStorageRepositoryInterface from "../Repositories/LocalStorage/LocalStorageRepositoryInterface";
import RetailCrmApiRepositoryInterface from "../Repositories/RetailCrm/RetailCrmApiRepositoryInterface";
import ExportedOrdersInfoType from "../Types/Crm/ExportedOrdersInfoType";
import OrderForExportType from "../Types/Crm/OrderForExportType";

export default class ExportOrdersService {

    /**
     * LocalStorageRepositoryInterface
     */
    protected localStorageRepository: LocalStorageRepositoryInterface;

    /**
     * RetailCrmApiRepositoryInterface
     */
    protected retailCrmApiRepository: RetailCrmApiRepositoryInterface;

    /**
     * LoggerService
     */
    protected logger: LoggerService;


    /**
     * Constructor
     */
    constructor(
        localStorageRepository: LocalStorageRepositoryInterface,
        retailCrmApiRepository: RetailCrmApiRepositoryInterface,
    ) {
        this.localStorageRepository = localStorageRepository;
        this.retailCrmApiRepository = retailCrmApiRepository;
        this.logger = IOC.make(LoggerService) as LoggerService;
    }

    /**
     * Export new orders
     */
    public async export(): Promise<void> {

        // Get orders for export
        const orders = await this.getOrdersForExport();

        // Export orders
        const exportedOrders = await this.exportToCrm(orders);

        await this.updateExportedOrdersStatus(exportedOrders);
    }

    /**
     * Prepare orders for export
     */
    private async getOrdersForExport(): Promise<OrderForExportType[] | []> {
        // Log
        this.logger.info(`[EXPORT TO CRM] Start preparing export orders`);

        const orders = await this.localStorageRepository.getOrdersToExport();

        // Log
        this.logger.info(`[EXPORT TO CRM] Prepared ${orders.length} orders for export`);

        if (!orders.length) {
            throw new NoNewOrdersException();
        }

        return orders;
    }

    /**
     * Export orders to crm
     */
    private async exportToCrm(orders: OrderForExportType[]): Promise<ExportedOrdersInfoType[]> {
        // Log
        this.logger.info(`[EXPORT TO CRM] Start export orders to crm`);


        let exportpromiseAllResults = new Array();
        for (const chunkedOrders of this.chunkArray(orders, 10)) {
            // Init export promise
            const exportPromise = new Array();
            const loggingPromise = new Array();

            for (const order of chunkedOrders) {
                exportPromise.push(this.retailCrmApiRepository.exportOrder(order));
                loggingPromise.push(this.localStorageRepository.log(order.id, 'info', 'Start export'));
                loggingPromise.push(this.localStorageRepository.log(order.id, 'info', `Export data: ${JSON.stringify(order)}`));
            }

            // Run export promises
            await Promise.allSettled(loggingPromise);

            // Run export promises
            exportpromiseAllResults = exportpromiseAllResults.concat(await Promise.allSettled(exportPromise));
        }


        // Get only fulfilled result
        const fulfilledResult = new Array();
        for (const result of exportpromiseAllResults) {
            if (result.status === 'fulfilled') {
                this.logger.info(`[EXPORT TO CRM] Order ${result.value.number} exported successfully`);
                fulfilledResult.push(result.value);

            } else {
                // Log
                this.logger.error(`[EXPORT TO CRM] An error occurred while exporting the order`, result.reason);

                // Log to db
                const errorMessage = result.reason.response.length ? result.reason.response : JSON.stringify(result.reason);
                await this.localStorageRepository.log(JSON.parse(result.reason.params.order).id, 'error', errorMessage);
            }
        }
        return fulfilledResult;
    }

    /**
     * Update exported orders status
     */
    private async updateExportedOrdersStatus(ordersInfo: ExportedOrdersInfoType[]): Promise<void> {
        // Log
        this.logger.info(`[EXPORT TO CRM] Start update exported orders status`);

        const promise = new Array();
        for (const response of ordersInfo) {

            // Prepare params
            const order = JSON.parse(response.params);

            // Update order 'crm status'
            promise.push(this.localStorageRepository.updateExportedOrderStatus(order.id));

            // Set crmId to crm order
            promise.push(this.localStorageRepository.setCrmIdToCrmOrder(order.id, response.id));

            // Log to db
            promise.push(this.localStorageRepository.log(order.id, 'info', 'Order exported successfully'));
        }

        // Run all promises
        await Promise.allSettled(promise);

        // Log
        this.logger.info(`[EXPORT TO CRM] Exported order statuses updated successfully`);
    }

    /**
     * Chunk array
     */
    private chunkArray(arr: any[], chunkSize: number): any[] {
        const res = new Array();
        for (let i = 0; i < arr.length; i += chunkSize) {
            const chunk = arr.slice(i, i + chunkSize);
            res.push(chunk);
        }
        return res;
    }
}
