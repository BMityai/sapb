import axios, { AxiosInstance } from "axios";
import dayjs from "dayjs";
import Helper from "sosise-core/build/Helper/Helper";
import kaspibankConfig from "../../../config/kaspiBank";
import storesConfig from "../../../config/stores";
import KaspiOrderStatesEnum from "../../Enums/KaspiOrderStatesEnum";
import KaspiOrderStatusesEnum from "../../Enums/KaspiOrderStatusesEnum";
import KaspiBankApiRepositoryInterface from "./KaspiBankApiRepositoryInterface";
import lodash, { isEmpty, isNull } from 'lodash';
import KaspiRequestException from "../../Exceptions/KaspiRequestException";
import RequestHeadersType from "../../Types/Kaspi/RequestHeadersType";
import KaspiOrderType from "../../Types/Kaspi/KaspiOrderType";
import Exception from "sosise-core/build/Artisan/Make/Exception";
import KaspiOrderEntriesType from "../../Types/Kaspi/KaspiOrderEntriesType";
import KaspiOrderEntryProductType from "../../Types/Kaspi/KaspiOrderEntryProductType";
import KaspiOrderEntryDeliveryPointOfServiceType from "../../Types/Kaspi/KaspiOrderEntryDeliveryPointOfServiceType";
import KaspiOrderEntryMerchantProductType from "../../Types/Kaspi/KaspiOrderEntryMerchantProductType";
import KaspiOrderStatusType from "../../Types/Kaspi/KaspiOrderStatusType";
import ReturnRequestedOrReturnedOrderType from "../../Types/Kaspi/ReturnRequestedOrReturnedOrderType";
import OrderForChangeStatusType from "../../Types/Crm/OrderForChangeStatusType";
import LocalOrderItemType from "../../Types/Crm/LocalOrderItemType";




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
    public async getNewOrdersOfOneStore(store: string): Promise<KaspiOrderType[]> {
        // Prepare headers
        this.headers = this.getHeaders(store);

        // Get date ... days ago in milliseconds
        const date = this.getDateOfTheExpiredPeriodInMilliseconds(kaspibankConfig.period);

        // Prepare params
        const params = {
            'page[number]': 0,
            'page[size]': kaspibankConfig.orderPerPage,
            'filter[orders][state]': KaspiOrderStatesEnum.new,
            'filter[orders][status]': KaspiOrderStatusesEnum.approved,
            'filter [orders][creationDate][$ge]': date
        };


        let allOrders = new Array();
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

            allOrders = allOrders.concat(orders);
        }

        // Typecast
        const typedOrders = new Array();
        for (const order of allOrders) {
            typedOrders.push(this.typecastOrder(order, store));
        }
        return typedOrders;
    }

    /**
     * Get order entries
     */
    public async getOrderEntries(entriesLink: string, store: string): Promise<KaspiOrderEntriesType[]> {

        // Prepare headers
        const headers = this.getHeaders(store);

        // Send request
        const response = await this.httpClient.get('', {
            baseURL: entriesLink,
            headers
        });

        // Typecast
        const typedEntries = new Array();
        for (const entry of response.data.data) {
            const entries: KaspiOrderEntriesType = {
                id: entry.id,
                attributes: {
                    quantity: entry.attributes.quantity,
                    totalPrice: entry.attributes.totalPrice,
                    entryNumber: entry.attributes.entryNumber,
                    deliveryCost: entry.attributes.deliveryCost,
                    basePrice: entry.attributes.basePrice
                },
                productLink: entry.relationships.product.links.related,
                deliveryPointOfServiceLink: entry.relationships.deliveryPointOfService.links.related,
            };
            typedEntries.push(entries);
        }

        return typedEntries;
    }

    /**
     * Get entry product
     */
    public async getEntryProduct(productLink: string, store: string): Promise<KaspiOrderEntryProductType> {

        // Prepare headers
        const headers = this.getHeaders(store);

        // Send request
        const response = await this.httpClient.get('', {
            baseURL: productLink,
            headers
        });

        // Typecast
        const product: KaspiOrderEntryProductType = {
            id: response.data.data.id,
            attributes: {
                code: response.data.data.attributes.code,
                name: response.data.data.attributes.name,
            },
            merchantProductLink: response.data.data.relationships.merchantProduct.links.related,
        };

        return product;
    }

    /**
     * Get order delivery point of services
     */
    public async getEntryDeliveryPointOfServices(entry: KaspiOrderEntriesType, store: string): Promise<KaspiOrderEntryDeliveryPointOfServiceType> {

        // Prepare headers
        const headers = this.getHeaders(store);

        // Send request
        const response = await this.httpClient.get('', {
            baseURL: entry.deliveryPointOfServiceLink,
            headers
        });

        // Typecast
        const deliveryPointOfService: KaspiOrderEntryDeliveryPointOfServiceType = {
            id: response.data.data.id,
            attributes: {
                address: {
                    streetName: lodash.get(response.data.data, 'attributes.address.streetName', null),
                    streetNumber: lodash.get(response.data.data, 'attributes.address.streetNumber', null),
                    town: lodash.get(response.data.data, 'attributes.address.town', null),
                    district: lodash.get(response.data.data, 'attributes.address.district', null),
                    building: lodash.get(response.data.data, 'attributes.address.building', null),
                    apartment: lodash.get(response.data.data, 'attributes.address.apartment', null),
                    formattedAddress: lodash.get(response.data.data, 'attributes.address.formattedAddress', null),
                    latitude: lodash.get(response.data.data, 'attributes.address.latitude', null),
                    longitude: lodash.get(response.data.data, 'attributes.address.longitude', null)
                },
                displayName: response.data.data.attributes.displayName
            },
            method: this.getEntryDeliveryPointOfServices.name,
            entryId: entry.id
        };

        return deliveryPointOfService;
    }

    /**
     * Get order merchant product
     */
    public async getEntryMerchantProduct(merchantProductLink: string, store: string): Promise<KaspiOrderEntryMerchantProductType> {

        // Prepare headers
        const headers = this.getHeaders(store);

        // Send request
        const response = await this.httpClient.get('', {
            baseURL: merchantProductLink,
            headers
        });

        // Typecast
        const merchantProduct: KaspiOrderEntryMerchantProductType = {
            id: response.data.data.id,
            attributes: {
                code: response.data.data.attributes.code,
                name: response.data.data.attributes.name,
                manufacturer: lodash.get(response.data.data, 'attributes.manufacturer', null)
            }
        };

        return merchantProduct;
    }

    /**
     * Get entry delivery point of service
     */
    public async getEntryDeliveryPointOfService(deliveryPointOfServiceLink: string, store: string): Promise<KaspiOrderEntryDeliveryPointOfServiceType> {

        // Prepare headers
        const headers = this.getHeaders(store);

        // Send request
        const response = await this.httpClient.get('', {
            baseURL: deliveryPointOfServiceLink,
            headers
        });

        // Typecast
        const deliveryPointOfService: KaspiOrderEntryDeliveryPointOfServiceType = {
            id: response.data.data.id,
            attributes: {
                address: {
                    streetName: response.data.data.attributes.address.streetName,
                    streetNumber: response.data.data.attributes.address.streetNumber,
                    town: response.data.data.attributes.address.town,
                    district: response.data.data.attributes.address.district,
                    building: response.data.data.attributes.address.building,
                    apartment: response.data.data.attributes.address.apartment,
                    formattedAddress: response.data.data.attributes.address.formattedAddress,
                    latitude: response.data.data.attributes.address.latitude,
                    longitude: response.data.data.attributes.address.longitude
                },
                displayName: response.data.data.attributes.displayName,
            },
        };

        return deliveryPointOfService;
    }

    /**
     * Typecast order
     */
    private typecastOrder(order: any, store: string): KaspiOrderType {
        return {
            id: order.id,
            attributes: {
                code: order.attributes.code,
                totalPrice: order.attributes.totalPrice,
                paymentMode: order.attributes.paymentMode,
                plannedDeliveryDate: this.getFormattedDate(lodash.get(order.attributes, 'plannedDeliveryDate', null)),
                reservationDate: this.getFormattedDate(lodash.get(order.attributes, 'reservationDate', null)),
                creationDate: order.attributes.creationDate,
                deliveryCostForSeller: order.attributes.deliveryCostForSeller,
                isKaspiDelivery: order.attributes.isKaspiDelivery,
                deliveryCostPrePaid: lodash.get(order.attributes, 'deliveryCostPrePaid', false),
                deliveryMode: order.attributes.deliveryMode,
                signatureRequired: order.attributes.signatureRequired,
                creditTerm: order.attributes.creditTerm,
                preOrder: order.attributes.preOrder,
                state: order.attributes.state,
                approvedByBankDate: order.attributes.approvedByBankDate,
                status: order.attributes.status,
                deliveryCost: order.attributes.deliveryCost,
                assembled: order.attributes.assembled,
                deliveryAddress: {
                    streetName: lodash.get(order.attributes, 'deliveryAddress.streetName', null),
                    streetNumber: lodash.get(order.attributes, 'deliveryAddress.streetNumber', null),
                    town: lodash.get(order.attributes, 'deliveryAddress.town', null),
                    district: lodash.get(order.attributes, 'deliveryAddress.district', null),
                    building: lodash.get(order.attributes, 'deliveryAddress.building', null),
                    apartment: lodash.get(order.attributes, 'deliveryAddress.apartment', null),
                    formattedAddress: lodash.get(order.attributes, 'deliveryAddress.formattedAddress', null),
                    latitude: lodash.get(order.attributes, 'deliveryAddress.latitude', null),
                    longitude: lodash.get(order.attributes, 'deliveryAddress.longitude', null),
                },
                customer: {
                    id: order.attributes.customer.id,
                    name: lodash.get(order.attributes, 'customer.name', null),
                    cellPhone: lodash.get(order.attributes, 'customer.cellPhone', null),
                    firstName: lodash.get(order.attributes, 'customer.firstName', null),
                    lastName: lodash.get(order.attributes, 'customer.lastName', null)
                },
                kaspiDelivery: {
                    waybill: lodash.get(order.attributes, 'kaspiDelivery.waybill', null),
                    courierTransmissionDate: lodash.get(order.attributes, 'kaspiDelivery.courierTransmissionDate', null),
                    courierTransmissionPlanningDate: lodash.get(order.attributes, 'kaspiDelivery.courierTransmissionPlanningDate', null),
                    waybillNumber: lodash.get(order.attributes, 'kaspiDelivery.waybillNumber', null),
                    express: lodash.get(order.attributes, 'kaspiDelivery.express', false),
                    returnedToWarehouse: lodash.get(order.attributes, 'kaspiDelivery.returnedToWarehouse', false),
                },
            },
            entriesLink: order.relationships.entries.links.related,
            store
        };
    }

    /**
     * Get order statuses by kaspiId from kaspi
     */
    public async getOrderStatusByKaspiId(kaspiId: string, site: string): Promise<KaspiOrderStatusType> {

        // Prepare uri
        const uri = 'orders/' + kaspiId;

        // Prepare header
        const headers = this.getHeaders(site);

        const response = await this.makeRequest(uri, 'GET', null, null, headers);

        // Typecast response
        const typedResponse: KaspiOrderStatusType = {
            status: lodash.get(response, 'data.data.attributes.status', null),
            state: lodash.get(response, 'data.data.attributes.state', null),
        };
        return typedResponse;
    }

    /**
     * Get return requested orders
     */
    public async getReturnRequestedOrdersPerStore(store: string): Promise<ReturnRequestedOrReturnedOrderType[] | []> {
        // Prepare headers
        this.headers = this.getHeaders(store);

        // Get date ... days ago in milliseconds
        const date = this.getDateOfTheExpiredPeriodInMilliseconds(kaspibankConfig.returnRequestedPeriod);

        // Prepare params
        const params = {
            'page[number]': 0,
            'page[size]': kaspibankConfig.orderPerPage,
            'filter[orders][state]': KaspiOrderStatesEnum.kaspiDelivery,
            'filter[orders][status]': KaspiOrderStatusesEnum.returnRequested,
            'filter [orders][creationDate][$ge]': date
        };

        // Make request
        const response = await this.makeRequest('orders', 'GET', params, null, this.headers);

        // Get orders
        const orders = lodash.get(response, 'data.data', []);

        if (isEmpty(orders)) {
            return [];
        }
        // Typecast orders
        const typedReturnRequestedOrders = new Array();
        for (const returnedOrder of orders) {

            const typedOrder: ReturnRequestedOrReturnedOrderType = {
                code: returnedOrder.attributes.code,
                kaspiId: returnedOrder.id,
                kaspiState: returnedOrder.attributes.state,
                kaspiStatus: returnedOrder.attributes.status,
            };

            typedReturnRequestedOrders.push(typedOrder);
        }
        return typedReturnRequestedOrders;
    }

    /**
     * Get returned orders
     */
    public async getReturnedOrdersPerStore(store: string): Promise<ReturnRequestedOrReturnedOrderType[] | []> {
        // Prepare headers
        this.headers = this.getHeaders(store);

        // Get date ... days ago in milliseconds
        const date = this.getDateOfTheExpiredPeriodInMilliseconds(kaspibankConfig.returnRequestedPeriod);

        // Prepare params
        const params = {
            'page[number]': 0,
            'page[size]': kaspibankConfig.orderPerPage,
            'filter[orders][state]': KaspiOrderStatesEnum.archive,
            'filter[orders][status]': KaspiOrderStatusesEnum.returned,
            'filter [orders][creationDate][$ge]': date
        };

        // Make request
        const response = await this.makeRequest('orders', 'GET', params, null, this.headers);

        // Get orders
        const orders = lodash.get(response, 'data.data', []);

        if (isEmpty(orders)) {
            return [];
        }
        // Typecast orders
        const typedReturnRequestedOrders = new Array();
        for (const returnedOrder of orders) {

            const typedOrder: ReturnRequestedOrReturnedOrderType = {
                code: returnedOrder.attributes.code,
                kaspiId: returnedOrder.id,
                kaspiState: returnedOrder.attributes.state,
                kaspiStatus: returnedOrder.attributes.status,
            };

            typedReturnRequestedOrders.push(typedOrder);
        }
        return typedReturnRequestedOrders;
    }

    /**
     * Get order waybill link
     */
    public async getWaybillLinkByKaspiId(kaspiId: string, site: string): Promise<string | null> {

        // Prepare uri
        const uri = 'orders/' + kaspiId;

        // Prepare header
        const headers = this.getHeaders(site);

        // Send request
        const response = await this.makeRequest(uri, 'GET', null, null, headers);

        return lodash.get(response, 'data.data.attributes.kaspiDelivery.waybill', null);
    }

    /**
     * Change order status
     */
    public async changeOrderStatus(orderFromLocalDb: OrderForChangeStatusType): Promise<void> {
        const attributes: {
            status: string;
            cancellationReason?: string;
        } = {
            status: orderFromLocalDb.kaspiOrderStatus
        };

        if (orderFromLocalDb.kaspiOrderStatus === KaspiOrderStatusesEnum.canceled || orderFromLocalDb.kaspiOrderStatus === KaspiOrderStatusesEnum.canceling) {
            attributes.cancellationReason = 'MERCHANT_OUT_OF_STOCK';
        }

        const body = {
            data: {
                type: 'orders',
                id: orderFromLocalDb.kaspiId,
                attributes
            }
        };

        // Get headers
        const headers = this.getHeaders(orderFromLocalDb.site);

        // Send request
        await this.makeRequest('orders', 'POST', null, body, headers);
    }

    /**
     * Update item qty
     */
    public async updateItemQty(item: LocalOrderItemType, site: string): Promise<void> {
        const body = {
            data: {
                type: 'orderEntryCancelOperation',
                attributes: {
                    notes: 'Нет в наличии',
                    remainedQuantity: item.qty,
                    reason: 'MERCHANT_OUT_OF_STOCK'
                },
                relationships: {
                    entry: {
                        data: {
                            type: 'orderentries',
                            id: item.entriesKaspiId
                        }
                    }
                }
            }
        };

        // Get headers
        const headers = this.getHeaders(site);

        await this.makeRequest('orderEntryCancelOperation', 'POST', null, body, headers);
    }

    /**
     * Formatted date
     */
    private getFormattedDate(date: string | null): string | null {
        if (isNull(date)) {
            return null;
        }
        return dayjs(date).format('YYYY-MM-DDTHH:mm:ss');
    }

    /**
     * Make request
     */
    private async makeRequest(url: string, method: "GET" | "DELETE" | "POST" | "PUT", params: any = null, body: any = null, headers: any = null): Promise<any> {
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
    private getDateOfTheExpiredPeriodInMilliseconds(period: number): number {
        return dayjs().add(period, 'day').valueOf();
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
