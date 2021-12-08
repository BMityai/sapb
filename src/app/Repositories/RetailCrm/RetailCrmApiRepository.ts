import axios, { AxiosInstance } from "axios";
import retailcrmConfig from "../../../config/retailCrm";
import CrmRequestException from "../../Exceptions/CrmRequestException";
import OrderForExportType from "../../Types/Crm/OrderForExportType";
import RetailCrmApiRepositoryInterface from "./RetailCrmApiRepositoryInterface";
import lodash from 'lodash';
import ExportedOrdersInfoType from "../../Types/Crm/ExportedOrdersInfoType";
import Helper from "sosise-core/build/Helper/Helper";
import UnfinishedOrdersType from "../../Types/Kaspi/UnfinishedOrdersType";
import ParamsForOrderStatusChangeInCrmType from "../../Types/Kaspi/ParamsForOrderStatusChangeInCrmType";
import OrderForSetWayBillLinkType from "../../Types/Kaspi/OrderForSetWayBillLinkType";


export default class RetailCrmApiRepository implements RetailCrmApiRepositoryInterface {

    static MAX_SEND_RETRIES = 5;
    static DELAY_BETWEEN_RETRIES_IN_MS = 500;
    static API_PREFIX = '/api/v5';

    private httpClient: AxiosInstance;
    private baseUrl: string;
    private apiKey: string;


    /**
     * Constructor
     */
    constructor() {
        this.baseUrl = retailcrmConfig.api.baseUrl as string;
        this.apiKey = retailcrmConfig.api.key as string;
        this.httpClient = axios.create({
            baseURL: this.baseUrl,
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
            },
        });
    }

    /**
     * Export order to crm
     */
    public async exportOrder(order: OrderForExportType): Promise<ExportedOrdersInfoType> {

        // Prepare params
        const params = {
            apiKey: this.apiKey,
            site: order.site,
            order: JSON.stringify(order)
        };

        // Send request to crm
        const response = await this.makeRequest(RetailCrmApiRepository.API_PREFIX + '/orders/create', 'POST', null, params);

        // Typecast response data
        const exportedOrderInfo: ExportedOrdersInfoType = {
            id: response.data.order.id,
            number: response.data.order.number,
            params: params.order
        };

        return exportedOrderInfo;
    }

    /**
     * Sync order status to crm
     */
    public async changeOrderStatus(order: ParamsForOrderStatusChangeInCrmType): Promise<ParamsForOrderStatusChangeInCrmType> {
        const url = RetailCrmApiRepository.API_PREFIX + '/orders/' + order.crmId + '/edit';
        const params = {
            apiKey: this.apiKey,
            site: order.site,
            by: 'id',
            order: JSON.stringify({
                customFields: {
                    kaspi_order_status: order.crmStatus
                }
            })
        };
        try {
            // Send request
            await this.makeRequest(url, 'POST', null, params);
        } catch (err) {
            throw new CrmRequestException(
                `Maximum amount of ${RetailCrmApiRepository.MAX_SEND_RETRIES} tries is reached while requesting CRM`,
                { orderId: order.id },
                lodash.get(err, 'response.data', '')
            );
        }

        return order;
    }

    /**
     * Set waybill link
     */
    public async setWayBillLink(order: OrderForSetWayBillLinkType): Promise<OrderForSetWayBillLinkType> {
        const url = `${RetailCrmApiRepository.API_PREFIX}/orders/${order.crmId}/edit`;
        const params = {
            apiKey: this.apiKey,
            site: order.site,
            by: 'id',
            order: JSON.stringify({
                customFields: {
                    invoice_link: order.wayBillLink
                }
            })
        };

        try {
        // Send request
        await this.makeRequest(url, 'POST', null, params);
        } catch(err) {
            throw new CrmRequestException(
                `Maximum amount of ${RetailCrmApiRepository.MAX_SEND_RETRIES} tries is reached while requesting CRM`,
                { orderId: order.id },
                lodash.get(err, 'response.data', '')
            );
        }

        return order;
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
                    timeout: 60000
                });

                // Send response, everything is fine
                return response;
            } catch (error) {
                // Check for max tries
                if (tries === RetailCrmApiRepository.MAX_SEND_RETRIES) {
                    throw new CrmRequestException(
                        `Maximum amount of ${RetailCrmApiRepository.MAX_SEND_RETRIES} tries is reached while requesting CRM`,
                        params ?? body,
                        lodash.get(error, 'response.data', '')
                    );
                }
                // // Wait some time
                await new Promise(resolve => setTimeout(resolve, RetailCrmApiRepository.DELAY_BETWEEN_RETRIES_IN_MS));
            }
        }
    }
}
