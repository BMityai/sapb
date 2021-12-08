import axios, { AxiosInstance } from "axios";
import IOC from "sosise-core/build/ServiceProviders/IOC";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import loyaltyConfig from "../../../config/loyalty";
import KaspiOrderCustomerType from "../../Types/Kaspi/KaspiOrderCustomerType";
import LsApiRepositoryInterface from "./LsApiRepositoryInterface";

export default class LsApiRepository implements LsApiRepositoryInterface {

    private httpClient: AxiosInstance;
    private loggerService: LoggerService;

    private urlForGetCustomerInfo: string;
    private keyForGetCustomerInfo: string;
    private userForCustomerRegister: string;
    private keyForCustomerRegister: string;
    private urlForCustomerRegister: string;

    constructor() {
        this.urlForGetCustomerInfo = loyaltyConfig.api.urlForGetCustomerInfo as string;
        this.keyForGetCustomerInfo = loyaltyConfig.api.keyForGetCustomerInfo as string;
        this.userForCustomerRegister = loyaltyConfig.api.userForCustomerRegister as string;
        this.keyForCustomerRegister = loyaltyConfig.api.passForCustomerRegister as string;
        this.urlForCustomerRegister = loyaltyConfig.api.urlForCustomerRegister as string;
        this.loggerService = IOC.make(LoggerService) as LoggerService;
        this.httpClient = axios.create({
            baseURL: this.urlForGetCustomerInfo,
        });
    }


    /**
     * Get customer id from loyalty system
     */
    public async getCustomerIdLs(customer: KaspiOrderCustomerType): Promise<string | null> {
        const phoneNumber = '7' + customer.cellPhone;
        // Prepare params
        const paramsForGet = {
            key: this.keyForGetCustomerInfo,
            mobile: phoneNumber
        };

        try {

            // Get loyalty customer id if exist
            const lsCustomer = await this.httpClient.get('/lsgate/v1/customer/getIdByMobile', {params: paramsForGet});

            return lsCustomer.data.id;
        } catch (error) {
            if (error.response.status === 404) { // if not exist

                // Prepare params
                const paramsForRegister = {
                        mobile: '+' + phoneNumber,
                        name: customer.name ?? customer.firstName,
                        surname: customer.lastName,
                        shop: 'kaspi'
                    };

                // Register new customer by phone number
                const lsCustomer = await this.httpClient.post('/customer/add', paramsForRegister, {
                    baseURL: this.urlForCustomerRegister,
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    auth: {
                        username: this.userForCustomerRegister,
                        password: this.keyForCustomerRegister
                    }
                });
                return lsCustomer.data.customerId;
            } else {
                // Logger
                this.loggerService.critical(error.message);
            }
        }
        return null;
    }
}
