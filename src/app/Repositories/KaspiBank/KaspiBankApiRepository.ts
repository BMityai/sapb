import axios, { AxiosInstance } from "axios";
import dayjs from "dayjs";
import Helper from "sosise-core/build/Helper/Helper";
import kaspibankConfig from "../../../config/kaspiBank";
import storesConfig from "../../../config/stores";
import KaspiOrderStatesEnum from "../../Enums/KaspiOrderStatesEnum";
import KaspiOrderStatusesEnum from "../../Enums/KaspiOrderStatusesEnum";
import RequestHeadersType from "../../Types/Kaspi/RequestHeadersType";
import KaspiBankApiRepositoryInterface from "./KaspiBankApiRepositoryInterface";
import lodash, { isEmpty } from 'lodash';
import KaspiRequestException from "../../Exceptions/KaspiRequestException";
import OrderEntriesType from "../../Types/Kaspi/OrderEntriesType";
import OrderType from "../../Types/Kaspi/OrderType";



export default class KaspiBankApiRepository implements KaspiBankApiRepositoryInterface {

    static MAX_SEND_RETRIES = 5;
    static DELAY_BETWEEN_RETRIES_IN_MS = 500;

    private httpClient: AxiosInstance;
    private headers: RequestHeadersType;


    constructor() {
        this.httpClient = axios.create({
            baseURL: kaspibankConfig.api.baseurl
        });
    }

    /**
     * Get new orders from kaspi bank
     */
    public async getNewOrdersPerStore(store: string) {
        // Prepare headers
        this.headers = this.getHeaders(store);

        // Get date ... days ago in milliseconds
        const date = this.getDateOfTheExpiredPeriodInMilliseconds();

        // Prepare params
        const params = {
            'page[number]': 0,
            'page[size]': kaspibankConfig.orderPerPage,
            'filter[orders][state]': KaspiOrderStatesEnum.new,
            'filter[orders][status]': KaspiOrderStatusesEnum.approved,
            'filter [orders][creationDate][$ge]': date
        };

        const allNewOrders = await this.getAllOrdersUsingPagination(params);

        if (isEmpty(allNewOrders)) {
            return [];
        }
        // Typecast
        return await this.prepareTypeNewOrders(allNewOrders.flat(), store);

    }

    /**
     * Prepare new orders
     */
    private async prepareTypeNewOrders(allNewOrders: any, store: string): Promise<OrderType[]> {
        const orders = new Array();
        const getProductsPromise = new Array();

        for (const order of allNewOrders) {

            // Set store
            order.store = store;

            // Get per order products
            getProductsPromise.push(this.getProducts(order.relationships.entries.links.related, store));
        }

        // Run get products promise
        const allOrderProducts = await Promise.allSettled(getProductsPromise);

        // Set products to orders
        for (const [key, order] of Object.entries(allNewOrders)) {

            // Typecast order
            const typedOrder = new OrderType(order);

            // Set per order products
            typedOrder.entries = allOrderProducts[key].value;

            orders.push(typedOrder);
        }

        return orders;
    }

    /**
     * Get order products
     */
    private async getProducts(getEntriesUrl: string, store: string): Promise<OrderEntriesType> {
        const entries = await this.getEntries(getEntriesUrl, store);
        const headers = this.getHeaders(store);
        for (const entry of entries.products) {
            // Get product info
            const productInfoResponse = await this.httpClient.get('', { headers, baseURL: entry.getProductUrl });
            const getMerchantProductUrl = productInfoResponse.data.data.relationships.merchantProduct.links.related;
            entry.masterProduct.kaspiId = productInfoResponse.data.data.id;
            entry.masterProduct.code = productInfoResponse.data.data.attributes.code;
            entry.masterProduct.name = productInfoResponse.data.data.attributes.name;
            entry.masterProduct.manufacturer = lodash.get(productInfoResponse.data, 'data.attributes.manufacturer', null);

            // Set product
            const productResponse = await this.httpClient.get('', { headers, baseURL: getMerchantProductUrl });
            entry.merchantProduct.kaspiId = productResponse.data.data.id;
            entry.merchantProduct.code = productResponse.data.data.attributes.code;
            entry.merchantProduct.name = productResponse.data.data.attributes.name;
            entry.merchantProduct.manufacturer = lodash.get(productResponse.data, 'data.attributes.manufacturer', null);
        }

        // Set delivery poit of service
        const poinOfServiceResponse = await this.httpClient.get('', { headers, baseURL: entries.deliveryPointOfService.getPointOfServiceUrl });
        entries.deliveryPointOfService.displayName = poinOfServiceResponse.data.data.attributes.displayName;
        entries.deliveryPointOfService.kaspiId = poinOfServiceResponse.data.data.id;
        entries.deliveryPointOfService.streetName = lodash.get(poinOfServiceResponse.data, 'data.attributes.address.streetName', null);
        entries.deliveryPointOfService.streetNumber = lodash.get(poinOfServiceResponse.data, 'data.attributes.address.streetNumber', null);
        entries.deliveryPointOfService.town = lodash.get(poinOfServiceResponse.data, 'data.attributes.address.town', null);
        entries.deliveryPointOfService.district = lodash.get(poinOfServiceResponse.data, 'data.attributes.address.district', null);
        entries.deliveryPointOfService.building = lodash.get(poinOfServiceResponse.data, 'data.attributes.address.building', null);
        entries.deliveryPointOfService.formattedAddress = lodash.get(poinOfServiceResponse.data, 'data.attributes.address.formattedAddress', null);

        return entries;
    }

    /**
     * Get order entries (products and delivery point of services)
     */
    private async getEntries(getEntriesUrl: string, store: string): Promise<OrderEntriesType> {

        // Prepare headers
        const headers = this.getHeaders(store);

        // Send request
        const response = await this.httpClient.get('', {
            baseURL: getEntriesUrl,
            headers
        });
        return new OrderEntriesType(response.data.data);
    }

    /**
     * Get all orders using pagination
     */
    private async getAllOrdersUsingPagination(params: any): Promise<any> {

        const allOrders = new Array();
        let allOrdersReceived = true;

        // Receive orders by page, using pagination
        while (allOrdersReceived) {

            const response = await this.makeRequest('orders', 'GET', params, null, this.headers);

            // Number of pages of all orders
            const pageCount = response.data.meta.pageCount;

            // Change to the next page
            params['page[number]']++;

            // Сycle condition check
            allOrdersReceived = pageCount > params['page[number]'];

            // Push new orders
            const orders = lodash.get(response, 'data.data', []);
            allOrders.push(orders);
        }

        return allOrders;
    }

    /**
     * Make request
     */
    private async makeRequest(url: string, method: "GET" | "DELETE" | "POST" | "PUT", params: any = null, body: any = null, headers: any = null, auth: any = null): Promise<any> {
        // Current amount of tries
        let tries = 0;

        // Try to send get request in endless loop
        while (true) {
            // Increment try
            tries++;

            try {
                // Make request
                const response = await this.httpClient.request({
                    url,
                    method,
                    params,
                    data: body,
                    headers,
                    timeout: 60000
                });

                // Send response, everything is fine
                return response;
            } catch (error) {
                // Check for max tries
                if (tries === KaspiBankApiRepository.MAX_SEND_RETRIES) {
                    throw new KaspiRequestException(
                        `Maximum amount of ${KaspiBankApiRepository.MAX_SEND_RETRIES} tries is reached while requesting Kaspi`,
                        params ?? body,
                        lodash.get(error, 'response.data', '')
                    );
                }
                await Helper.sleep(KaspiBankApiRepository.DELAY_BETWEEN_RETRIES_IN_MS);
            }
        }
    }

    /**
     * Get date in milliseconds for the past period
     */
    private getDateOfTheExpiredPeriodInMilliseconds(): number {
        return dayjs().add(kaspibankConfig.period, 'day').valueOf();
    }

    /**
     * Prepare headers for request
     */
    private getHeaders(store: string): RequestHeadersType {

        // Prepare api key
        let key = kaspibankConfig.api.apiKeyForMarwin as string;

        if (store === storesConfig.stores.komfort) {
            key = kaspibankConfig.api.apiKeyForKomfort as string;
        }

        // Prepare headers
        const headers: RequestHeadersType = {
            'X-Auth-Token': key,
            'Content-Type': 'application/vnd.api+json',
        };

        return headers;
    }



}
