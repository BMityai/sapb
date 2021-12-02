import lodash, { isNull } from "lodash";
import IOC from "sosise-core/build/ServiceProviders/IOC";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import storesConfig from "../../config/stores";
import KaspiBankApiRepositoryInterface from "../Repositories/KaspiBank/KaspiBankApiRepositoryInterface";
import LsApiRepositoryInterface from "../Repositories/LoyaltySystem/LsApiRepositoryInterface";
import RetailCrmApiRepositoryInterface from "../Repositories/RetailCrm/RetailCrmApiRepositoryInterface";
import LocalStorageRepositoryInterface from "../Repositories/LocalStorage/LocalStorageRepositoryInterface";
import LoggerToDbService from "./LoggerToDbService";
import OrderType from "../Types/Kaspi/OrderType";
import Helper from "sosise-core/build/Helper/Helper";

export default class GetNewOrdersFromKaspiService {
    protected kaspiBankApiRepository: KaspiBankApiRepositoryInterface;
    protected localStorageRepository: LocalStorageRepositoryInterface;
    protected retailCrmApiRepository: RetailCrmApiRepositoryInterface;
    protected lsApiRepository: LsApiRepositoryInterface;
    protected loggerToDbService: LoggerToDbService;
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
        this.loggerToDbService = IOC.make(LoggerToDbService) as LoggerToDbService;
        this.logger = IOC.make(LoggerService) as LoggerService;
    }

    /**
     * Get new orders from kaspi and convert to crm orders
     */
    public async getNewOrdersAndConvert(): Promise<void> {
        // Log
        this.logger.info('Start get new orders from kaspi');

        // Get orders from kaspi
        const orders = await this.getNewOrdersForAllStores();
        // If not found new orders
        if (!orders.length) {
            this.logger.info('No new orders for import');
            return;
        }

        Helper.dd(orders.length)

        // // Save to db
        // const savedOrders = await this.saveOrders(orders);

        // // Log
        // this.logger.info('Received ' + savedOrders.length + ' new orders from kaspi.');

        // await this.convertKaspiOrdersToCrmOrders(savedOrders);
    }

    /**
     * Get new orders for all stores
     */
     private async getNewOrdersForAllStores(): Promise<OrderType[]> {
        // Get stores list
        const stores = storesConfig.stores;


        // Promises
        const promises = new Array();

        // Get new orders for all stores
        for (const [store, url] of Object.entries(stores)) {
            promises.push(this.kaspiBankApiRepository.getNewOrdersPerStore(url));
        }

        // Run all promises
        const orders = await Promise.allSettled(promises);


        // Filter only fulfilled
        const fulfilledOrders = orders.map((order: any) => {
            if (order.status === 'fulfilled') {
                return order.value;
            }
        });

        return fulfilledOrders.flat();
    }

    // /**
    //  * Save orders to db
    //  */
    //  private async saveOrders(orders: OrderType[]): Promise<OrderType[]> {

    //     let savedOrders = new Array();
    //     let promises = new Array();

    //     // Prepare orders to save
    //     for (const order of orders) {

    //         // Get order from db
    //         let localOrder = await this.localStorageRepository.getOrderByKaspiId(order.kaspiId);

    //         // Check is null
    //         if (!isNull(localOrder)) {
    //             continue;
    //         }
    //         promises.push(this.localStorageRepository.saveKaspiOrder(order));
    //         savedOrders.push(order);

    //     }

    //     await Promise.allSettled(promises);

    //     return savedOrders;
    // }

    // /**
    //  * Convert kaspi order to crm order and save
    //  */
    //  public async convertKaspiOrdersToCrmOrders(orders: OrderFromKaspiBankType[]): Promise<void> {

    //     this.logger.info('Start convert and save crmOrder')

    //     const getCustomerIdLsPromise = new Array();

    //     for (const order of orders) {

    //         // Get customer id_ls from loyalty system
    //         getCustomerIdLsPromise.push(this.lsApiRepository.getOrRegisterCustomerInLs(order));

    //     }

    //     let saveCrmOrdersPromise = new Array();

    //     // Run getCustomersIdLs promise
    //     const customersIdLs = await Promise.allSettled(getCustomerIdLsPromise);

    //     // Set idLs for all order
    //     for (const [key, order] of Object.entries(orders)) {
    //         // Set id_ls
    //         order.customer.idLs = lodash.get(customersIdLs[key], 'value', null);

    //         // Save order
    //         saveCrmOrdersPromise.push(this.sapDbRepository.saveCrmOrders(order));
    //     }

    //     // Run all promises
    //     await Promise.allSettled(saveCrmOrdersPromise);

    //     this.logger.info('Orders are converted and saved')
    // }
}
