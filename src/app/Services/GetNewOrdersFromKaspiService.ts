import lodash, { isNull } from "lodash";
import IOC from "sosise-core/build/ServiceProviders/IOC";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import storesConfig from "../../config/stores";
import KaspiBankApiRepositoryInterface from "../Repositories/KaspiBank/KaspiBankApiRepositoryInterface";
import LsApiRepositoryInterface from "../Repositories/LoyaltySystem/LsApiRepositoryInterface";
import RetailCrmApiRepositoryInterface from "../Repositories/RetailCrm/RetailCrmApiRepositoryInterface";
import LocalStorageRepositoryInterface from "../Repositories/LocalStorage/LocalStorageRepositoryInterface";
import KaspiOrderType from "../Types/Kaspi/KaspiOrderType";
import KaspiOrderEntriesType from "../Types/Kaspi/KaspiOrderEntriesType";
import KaspiOrderEntryProductType from "../Types/Kaspi/KaspiOrderEntryProductType";
import NoNewOrdersException from "../Exceptions/NoNewOrdersException";


export default class GetNewOrdersFromKaspiService {
    protected kaspiBankApiRepository: KaspiBankApiRepositoryInterface;
    protected localStorageRepository: LocalStorageRepositoryInterface;
    protected retailCrmApiRepository: RetailCrmApiRepositoryInterface;
    protected lsApiRepository: LsApiRepositoryInterface;
    protected logger: LoggerService;



    /**
     * Constructor
     */
    constructor(
        kaspiBankApiRepository: KaspiBankApiRepositoryInterface,
        localStorageRepository: LocalStorageRepositoryInterface,
        retailCrmApiRepository: RetailCrmApiRepositoryInterface,
        LsApiRepository: LsApiRepositoryInterface
    ) {
        this.kaspiBankApiRepository = kaspiBankApiRepository;
        this.localStorageRepository = localStorageRepository;
        this.retailCrmApiRepository = retailCrmApiRepository;
        this.lsApiRepository = LsApiRepository;
        this.logger = IOC.make(LoggerService) as LoggerService;
    }

    /**
     * Get new orders from kaspi and convert to crm orders
     */
    public async getNewOrdersAndConvert(): Promise<void> {

        // Get orders from kaspi
        const orders = await this.getNewOrders();

        // Save orders to kaspi tables
        const savedOrders = await this.saveOrdersToKaspiTables(orders);

        // Convert orders and save to crm tabes
        await this.saveOrdersToCrmTables(savedOrders);
    }

    /**
     * Save orders to kaspi tables
     */
    protected async saveOrdersToKaspiTables(orders: KaspiOrderType[]): Promise<KaspiOrderType[]> {

        const savedOrders = new Array();
        const saveOrderPromises = new Array();

        // Prepare orders to save
        for (const order of orders) {

            // Push to promises
            saveOrderPromises.push(this.localStorageRepository.saveKaspiOrder(order));

            // Prepare saved orders
            savedOrders.push(order);
        }

        if (!savedOrders.length) {
            throw new NoNewOrdersException();
        }

        // Log
        this.logger.info('[GET NEW ORDERS FROM KASPI] Received ' + savedOrders.length + ' new orders from kaspi.', savedOrders);
        this.logger.info('[GET NEW ORDERS FROM KASPI] Start saving orders to the Kaspi tables ');

        // Push to promises
        await Promise.all(saveOrderPromises);

        this.logger.info('[GET NEW ORDERS FROM KASPI] Saving orders to kaspi tables completed successfully');

        return savedOrders;
    }

    /**
     * Get new orders for all stores
     */
    protected async getNewOrders(): Promise<KaspiOrderType[]> {

        // Log
        this.logger.info('[GET NEW ORDERS FROM KASPI] Start');

        // Get orders without entries
        const ordersWithoutEntries = await this.getNewOrdersForAllStores();

        // Get order entries (products and delivery point of service) & concat to order
        const orders = await this.getEntriesAndConcatToOrder(ordersWithoutEntries);

        if (!orders.length) {
            throw new NoNewOrdersException();
        }

        return orders;
    }

    /**
     * Convert orders and save to crm tables
     */
    protected async saveOrdersToCrmTables(orders: KaspiOrderType[]): Promise<void> {

        // Get and concat customer id ls to order
        const ordersWithCustomerIdLs = await this.getAndConcatCustomerIdLsToOrder(orders);

        // Sve orders
        await this.saveCrmOrders(ordersWithCustomerIdLs);

        // Log
        this.logger.info('[GET NEW ORDERS FROM KASPI] Finish');
    }

    /**
     * Get and concat customer id ls
     */
    private async getAndConcatCustomerIdLsToOrder(orders: KaspiOrderType[]): Promise<KaspiOrderType[]> {
        // Log
        this.logger.info('[GET NEW ORDERS FROM KASPI] Start of receiving customer id from loyalty system');

        const getCustomerIdLsPromise = new Array();

        for (const order of orders) {
            // Get customer id_ls from loyalty system
            getCustomerIdLsPromise.push(this.lsApiRepository.getCustomerIdLs(order.attributes.customer));
        }

        // Run getCustomersIdLs promise
        const customersIdLs = await Promise.allSettled(getCustomerIdLsPromise);

        // Set idLs for all order
        for (const [key, order] of Object.entries(orders)) {
            // Set id_ls
            order.attributes.customer.idLs = lodash.get(customersIdLs[key], 'value', null);
        }

        this.logger.info('[GET NEW ORDERS FROM KASPI] Customer id ls received successfully');

        return orders;
    }

    private async saveCrmOrders(orders: KaspiOrderType[]): Promise<void> {

        // Log
        this.logger.info('[GET NEW ORDERS FROM KASPI] Start convert and save orders to all crm order tables');

        for (const order of orders) {
            await this.localStorageRepository.saveCrmOrder(order);
        }

        // Log
        this.logger.info('[GET NEW ORDERS FROM KASPI] Saving orders to crm tables completed successfully');
    }

    /**
     * Get entries and concat to order
     */
    private async getEntriesAndConcatToOrder(orders: KaspiOrderType[]): Promise<KaspiOrderType[]> {
        // Get entries

        const ordersWithEntries = new Array();
        /**
         * Attention! Don't call asynchronously. Kaspi returns 429 error code
         */
        for (const order of orders) {

            // Get order from db
            const localOrder = await this.localStorageRepository.getOrderByKaspiId(order.id);

            // Skip if the order already exists
            if (!isNull(localOrder)) {
                continue;
            }

            try {
                order.entries = await this.getEntriesOfOneOrder(order);
                ordersWithEntries.push(order);
            } catch (error) {
                this.logger.error(`An error occured while retrieving order entries, order code: ${order.attributes.code}`, error);
            }
        }
        return ordersWithEntries;
    }

    /**
     * Get entries of one order
     */
    private async getEntriesOfOneOrder(order: KaspiOrderType) {

        // Get entries
        const entries = await this.kaspiBankApiRepository.getOrderEntries(order.entriesLink, order.store);

        // Get products and delivery point of service from entries
        const getEntriesPromise = new Array();
        for (const entry of entries) {
            getEntriesPromise.push(this.getEntryProduct(entry, order.store));
            getEntriesPromise.push(this.kaspiBankApiRepository.getEntryDeliveryPointOfServices(entry, order.store));
        }

        const getEntriesPromisesResult = await Promise.all(getEntriesPromise);

        // Prepare (concat products and delivery point of service)
        for (const entry of entries) {

            for (const result of getEntriesPromisesResult) {
                if (entry.id !== result.entryId) continue;

                // Is product
                if (result.method === this.getEntryProduct.name) {
                    entry.product = result;
                    continue;
                }

                // Is delivery point of service
                if (result.method === this.kaspiBankApiRepository.getEntryDeliveryPointOfServices.name) {
                    entry.deliveryPointOfService = result;
                    continue;
                }
            }
        }

        return entries;
    }

    /**
     * Get products
     */
    private async getEntryProduct(entry: KaspiOrderEntriesType, store: string): Promise<KaspiOrderEntryProductType> {
        const product = await this.kaspiBankApiRepository.getEntryProduct(entry.productLink, store);
        product.merchantProduct = await this.kaspiBankApiRepository.getEntryMerchantProduct(product.merchantProductLink, store);
        product.method = this.getEntryProduct.name;
        product.entryId = entry.id;
        return product;
    }

    /**
     * Get new orders for all stores
     */
    private async getNewOrdersForAllStores(): Promise<KaspiOrderType[]> {

        // Get stores list
        const stores = storesConfig.stores;

        // Promises
        const promises = new Array();

        // Get new orders for all stores
        for (const [store, url] of Object.entries(stores)) {
            promises.push(this.kaspiBankApiRepository.getNewOrdersOfOneStore(url));
        }

        // Run all promises
        const orders = await Promise.allSettled(promises);

        // Filter only fulfilled
        const fulfilledOrders = orders.map((order: any) => {
            if (order.status === 'fulfilled') {
                return order.value;
            } else {
                this.logger.error('[GET NEW ORDERS]', order.reason);
            }
        });

        return fulfilledOrders.flat();
    }

}
