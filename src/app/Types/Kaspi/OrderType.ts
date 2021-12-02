import dayjs from 'dayjs';
import lodash, { isNull } from 'lodash';
import KaspiOrderEntriesType from './OrderEntriesType';
import ParamsForCrmCustomerCustomFieldsTableType from './ParamsForCrmCustomerCustomFieldsTableType';
import ParamsForCrmOrderDeliveriesTableType from './ParamsForCrmOrderDeliveriesTableType';
import ParamsForCrmOrderDeliveryAddressesTableType from './ParamsForCrmOrderDeliveryAddressesTableType';
import ParamsForCrmOrderDeliveryServicesTableType from './ParamsForCrmOrderDeliveryServicesTableType';
import ParamsForCrmOrderItemOffersTableType from './ParamsForCrmOrderItemOffersTableType';
import ParamsForCrmOrderItemsTableType from './ParamsForCrmOrderItemsTableType';
import ParamsForCrmOrderTableType from './ParamsForCrmOrderTableType';
import ParamsForKaspiOrderCustomersType from './ParamsForKaspiOrderCustomersType';
import ParamsForKaspiOrderDeliveryPointOfServiceAddressesType from './ParamsForKaspiOrderDeliveryPointOfServiceAddressesType';
import ParamsForKaspiOrderDeliveryPointOfServiceType from './ParamsForKaspiOrderDeliveryPointOfServiceType';
import ParamsForKaspiOrderMerchantProductsTableType from './ParamsForKaspiOrderMerchantProductsTableType';
import ParamsForKaspiOrderProductsTableType from './ParamsForKaspiOrderProductsTableType';
import ParamsForKaspiOrderTableType from './ParamsForKaspiOrderTableType';
import ParamsForOrderTableType from './ParamsForOrderTableType';
export default class OrderType {
    public orderId: number | null;
    public kaspiId: string;
    public code: string;
    public state: string;
    public status: string;
    public paymentMode: string;
    public preOrder: boolean;
    public totalPrice: number;
    public deliveryCost: number | null;
    public signatureRequired: boolean;
    public isKaspiDelivery: boolean;
    public deliveryCostPrePaid: boolean | null;
    public creditTerm: number | null;
    public creationDate: string;
    public approvedByBankDate: string;
    public deliveryMode: string;
    public plannedDeliveryDate: string | null;
    public reservationDate: string | null;
    public waybillLink: string;

    public customer: {
        kaspiId: string,
        name: string | null,
        cellPhone: string | null,
        firstName: string | null,
        lastName: string | null,
        idLs: string | null
    } = {
            kaspiId: '',
            name: null,
            cellPhone: null,
            firstName: null,
            lastName: null,
            idLs: null
        };

    public deliveryAddress: {
        streetName: string | null;
        streetNumber: string | null;
        town: string | null;
        district: string | null;
        building: string | null;
        formattedAddress: string | null;
    } = {
            streetName: null,
            streetNumber: null,
            town: null,
            district: null,
            building: null,
            formattedAddress: null
        };

    private customFields: {
        kaspiOrderId: string  | null;
        sumOfPrepayment: number  | null;
        systemComment: string  | null;
        shippingCostInPaymentFlag: boolean | null;
        crmOrderId: number | null;
        isPreorder: boolean | null;
    } = {
        kaspiOrderId: null,
        sumOfPrepayment: null,
        systemComment: null,
        shippingCostInPaymentFlag: null,
        crmOrderId: null,
        isPreorder: null
    };
    public getEntriesUrl: string;
    public store: string;

    public entries: KaspiOrderEntriesType;

    private orderFromKaspiBank: any;

    constructor(orderFromKaspiBank: any) {
        // Set order from response
        this.orderFromKaspiBank = orderFromKaspiBank;

        // Prepare properties
        this.setProperties();

        // Remove service properties
        this.removeServiceProps();
    }

    /**
     * Set class properties
     */
    private setProperties(): void {

        // Set order data
        this.kaspiId = this.orderFromKaspiBank.id;
        this.code = this.orderFromKaspiBank.attributes.code;
        this.state = this.orderFromKaspiBank.attributes.state;
        this.status = this.orderFromKaspiBank.attributes.status;
        this.paymentMode = this.orderFromKaspiBank.attributes.paymentMode;
        this.preOrder = this.orderFromKaspiBank.attributes.preOrder;
        this.totalPrice = this.orderFromKaspiBank.attributes.totalPrice;
        this.deliveryCost = lodash.get(this.orderFromKaspiBank, 'attributes.deliveryCost', null);
        this.signatureRequired = this.orderFromKaspiBank.attributes.signatureRequired;
        this.isKaspiDelivery = this.orderFromKaspiBank.attributes.isKaspiDelivery;
        this.deliveryCostPrePaid = lodash.get(this.orderFromKaspiBank, 'attributes.deliveryCostPrePaid', null);
        this.creditTerm = lodash.get(this.orderFromKaspiBank, 'attributes.creditTerm', null);
        this.creationDate = dayjs(this.orderFromKaspiBank.attributes.creationDate).format('YYYY-MM-DDTHH:mm:ss');
        this.approvedByBankDate = dayjs(this.orderFromKaspiBank.attributes.approvedByBankDate).format('YYYY-MM-DDTHH:mm:ss');
        this.deliveryMode = this.orderFromKaspiBank.attributes.deliveryMode;
        this.plannedDeliveryDate = this.getFormattedDate(lodash.get(this.orderFromKaspiBank, 'attributes.plannedDeliveryDate', null));
        this.reservationDate = this.getFormattedDate(lodash.get(this.orderFromKaspiBank, 'attributes.reservationDate', null));
        this.waybillLink = lodash.get(this.orderFromKaspiBank, 'attributes.kaspiDelivery.waybill', null);

        // Set customer data
        this.customer.kaspiId = lodash.get(this.orderFromKaspiBank, 'attributes.customer.id', null);
        this.customer.name = lodash.get(this.orderFromKaspiBank, 'attributes.customer.name', null);
        this.customer.cellPhone = lodash.get(this.orderFromKaspiBank, 'attributes.customer.cellPhone', null);
        this.customer.firstName = lodash.get(this.orderFromKaspiBank, 'attributes.customer.firstName', null);
        this.customer.lastName = lodash.get(this.orderFromKaspiBank, 'attributes.customer.lastName', null);

        // Set dalivery data
        this.deliveryAddress.streetName = lodash.get(this.orderFromKaspiBank, 'attributes.deliveryAddress.streetName', null);
        this.deliveryAddress.streetNumber = lodash.get(this.orderFromKaspiBank, 'attributes.deliveryAddress.streetNumber', null);
        this.deliveryAddress.town = lodash.get(this.orderFromKaspiBank, 'attributes.deliveryAddress.town', null);
        this.deliveryAddress.district = lodash.get(this.orderFromKaspiBank, 'attributes.deliveryAddress.district', null);
        this.deliveryAddress.building = lodash.get(this.orderFromKaspiBank, 'attributes.deliveryAddress.building', null);
        this.deliveryAddress.formattedAddress = lodash.get(this.orderFromKaspiBank, 'attributes.deliveryAddress.formattedAddress', null);

        // Set custom fields
        this.customFields.isPreorder = this.preOrder;
        this.customFields.kaspiOrderId = this.code;
        this.customFields.shippingCostInPaymentFlag = this.deliveryCostPrePaid;

        // Set get entries url
        this.getEntriesUrl = this.orderFromKaspiBank.relationships.entries.links.related;

        // Set store
        this.store = this.orderFromKaspiBank.store;
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
     * Remove service properties
     */
    private removeServiceProps(): void {
        const props = ['orderFromKaspiBank'];
        for (const prop of props) {
            delete this[prop];
        }
    }

    /**
     * Get params for 'orders' table
     */
    public getParamsForOrdersTable(): ParamsForOrderTableType {
        // Prepare params
        const params: ParamsForOrderTableType = {
            appStatus: 'new',
            kaspiStatus: 'imported',
            site: this.store,
            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Get params for 'kaspi_orders' table
     */
    public getParamsForKaspiOrdersTable(orderId: number): ParamsForKaspiOrderTableType {
        this.orderId = orderId;
        // Prepare params
        const params: ParamsForKaspiOrderTableType = {
            kaspiId: this.kaspiId,
            code: this.code,
            state: this.state,
            status: this.status,
            paymentMode: this.paymentMode,
            preorder: this.preOrder,
            totalPrice: this.totalPrice,
            deliveryCost: this.deliveryCost,
            signatureRequired: this.signatureRequired,
            isKaspiDelivery: this.isKaspiDelivery,
            deliveryCostPrePaid: this.deliveryCostPrePaid,
            creditTerm: this.creditTerm,
            creationDate: this.creationDate,
            approvedByBankDate: this.approvedByBankDate,

            deliveryMode: this.deliveryMode,
            deliveryAddress_streetName: this.deliveryAddress.streetName,
            deliveryAddress_streetNumber: this.deliveryAddress.streetNumber,
            deliveryAddress_town: this.deliveryAddress.town,
            deliveryAddress_district: this.deliveryAddress.district,
            deliveryAddress_building: this.deliveryAddress.building,
            deliveryAddress_formattedAddress: this.deliveryAddress.formattedAddress,
            planned_delivery_date: this.plannedDeliveryDate,
            reservation_date: this.reservationDate,
            waybill_link: this.waybillLink,

            order_id: orderId,

            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Get params for 'kaspi_order_products' table
     */
    public getParamsForKaspiOrderProductsTable(kaspiOrderId: number): ParamsForKaspiOrderProductsTableType[] {
        const products = new Array();

        for (const entry of this.entries.products) {
            const product: ParamsForKaspiOrderProductsTableType = {
                kaspiId: entry.masterProduct.kaspiId,
                code: entry.masterProduct.code,
                name: entry.masterProduct.name,
                manufacturer: entry.masterProduct.manufacturer,
                quantity: entry.quantity,
                price: entry.basePrice,
                kaspi_order_id: kaspiOrderId,

                created_at: new Date(),
                updated_at: new Date()
            };
            products.push(product);
        }
        return products;
    }

    /**
     * Get params for 'kaspi_order_merchant_products' table
     */
    public getParamsForKaspiOrderMerchantProductsTable(firstProductId: number): ParamsForKaspiOrderMerchantProductsTableType[] {
        const products = new Array();

        for (const entry of this.entries.products) {
            const product: ParamsForKaspiOrderMerchantProductsTableType = {
                kaspiId: entry.merchantProduct.kaspiId,
                code: entry.merchantProduct.code,
                name: entry.merchantProduct.name,
                manufacturer: entry.merchantProduct.manufacturer,
                kaspi_order_product_id: firstProductId,

                created_at: new Date(),
                updated_at: new Date()
            };

            firstProductId++;

            products.push(product);
        }

        return products;
    }

    /**
     * Get params for 'kaspi_order_delivery_point_of_service' table
     */
    public getParamsForKaspiOrderDeliveryPoitOfServiceTable(kaspiOrderId: number): ParamsForKaspiOrderDeliveryPointOfServiceType {
        // Prepare params
        const params: ParamsForKaspiOrderDeliveryPointOfServiceType = {
            kaspiId: this.entries.deliveryPointOfService.kaspiId,
            displayName: this.entries.deliveryPointOfService.displayName,
            kaspi_order_id: kaspiOrderId,
            created_at: new Date(),
            updated_at: new Date()
        };

        return params;
    }

    /**
     * Get params for 'kaspi_order_delivery_point_of_service' table
     */
    public getParamsForKaspiOrderDeliveryPontOfServiceAddressesTable(deliveryPoinOfServiceId: number): ParamsForKaspiOrderDeliveryPointOfServiceAddressesType {

        // Prepare params
        const params: ParamsForKaspiOrderDeliveryPointOfServiceAddressesType = {
            streetName: this.entries.deliveryPointOfService.streetName,
            streetNumber: this.entries.deliveryPointOfService.streetNumber,
            town: this.entries.deliveryPointOfService.town,
            district: this.entries.deliveryPointOfService.district,
            building: this.entries.deliveryPointOfService.building,
            formattedAddress: this.entries.deliveryPointOfService.formattedAddress,
            kaspi_order_delivery_point_of_service_id: deliveryPoinOfServiceId,
            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Get params for 'kaspi_order_customers' table
     */
    public getParamsForKaspiOrderCutomersTable(kaspiOrderId: number): ParamsForKaspiOrderCustomersType {

        // Prepare params
        const params: ParamsForKaspiOrderCustomersType = {
            kaspiId: this.customer.kaspiId,
            name: this.customer.name,
            firstName: this.customer.firstName,
            lastName: this.customer.lastName,
            cellPhone: this.customer.cellPhone,
            kaspi_order_id: kaspiOrderId,
            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Get params for 'crm_order' table
     */
    public getParamsForCrmOrderTable(shipmentStore: string): ParamsForCrmOrderTableType {

        // Prepare params
        const params: ParamsForCrmOrderTableType = {
            site: this.store,
            crmId: null,
            orderMethod: 'kaspi-kz',
            status: 'new',
            number: 'KSP-' + this.code,
            phone: '+7' + this.customer.cellPhone,
            id_ls: this.customer.idLs,
            firstName: this.customer.name ?? this.customer.firstName,
            paymentType: this.convertKaspiOrderPaymentTypeToCrmOrderPaymentType(this.paymentMode),
            managerComment: null,
            shipmentStore,
            order_id: this.orderId,
            planned_delivery_date: this.plannedDeliveryDate,
            reservation_date: this.reservationDate,
            waybill_link: null,
            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Get params for 'crm_order_items' table
     */
    public getParamsForcrmOrderItemsTable(crmOrderId: number): ParamsForCrmOrderItemsTableType[] {

        // Prepare items
        const params = new Array();
        for (const product of this.entries.products) {

            // Prepare per item
            const item: ParamsForCrmOrderItemsTableType = {
                quantity: product.quantity,
                initialPrice: product.basePrice,
                crm_order_id: crmOrderId,
                created_at: new Date(),
                updated_at: new Date()
            };

            params.push(item);
        }
        return params;
    }

    /**
     * Get params for 'crm_order_item_offers' table
     */
    public getParamsForCrmOrderItemOffers(crmOrderFirstItemId: number): ParamsForCrmOrderItemOffersTableType[] {
        // Prepare items
        const params = new Array();
        for (const product of this.entries.products) {

            // Prepare per item
            const item: ParamsForCrmOrderItemOffersTableType = {
                xmlId: product.merchantProduct.code,
                crm_order_item_id: crmOrderFirstItemId,
                created_at: new Date(),
                updated_at: new Date()
            };
            params.push(item);
            crmOrderFirstItemId++;
        }
        return params;
    }

    /**
     * Prepare params for 'crm_order_deliveries' table
     */
    public getParamsForCrmOrderDeliveries(crmOrderId: number): ParamsForCrmOrderDeliveriesTableType {

        // Prepare params
        const params: ParamsForCrmOrderDeliveriesTableType = {
            code: this.convertKaspiOrderDeliveryModeToCrmOrderDeliveryCode(this.deliveryMode),
            cost: this.deliveryCost,
            crm_order_id: crmOrderId,
            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Prepare params for 'crm_order_delivery_services' table
     */
    public getParamsForCrmOrderDeliveryServicesTable(crmOrderDeliveryId: number, crmOrderDeliveryServiceCode: string): ParamsForCrmOrderDeliveryServicesTableType {

        // Prepare params
        const params: ParamsForCrmOrderDeliveryServicesTableType = {
            code: crmOrderDeliveryServiceCode,
            crm_order_delivery_id: crmOrderDeliveryId,
            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Get params for 'crm_order_delivery_addresses' table
     */
    public getParamsForCrmOrderDeliveryAddressesTable(crmOrderDeliveryServiceId: number): ParamsForCrmOrderDeliveryAddressesTableType {

        // Prepare params
        const params:ParamsForCrmOrderDeliveryAddressesTableType = {
            text: this.entries.deliveryPointOfService.formattedAddress,
            notes: this.entries.deliveryPointOfService.formattedAddress,
            crm_order_delivery_id: crmOrderDeliveryServiceId,
            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Get params for 'crm_order_custom_fields' table
     */
    public getParamsForCrmOrderCustomFields(crmOrderId: number): ParamsForCrmCustomerCustomFieldsTableType {

        // Prepare params
        const params: ParamsForCrmCustomerCustomFieldsTableType = {
            kaspi_order_id: this.customFields.kaspiOrderId as string,
            sum_of_prepayment: this.customFields.sumOfPrepayment as number,
            system_comment: this.customFields.systemComment as string,
            shipping_cost_in_payment_flag: this.customFields.shippingCostInPaymentFlag as boolean,
            crm_order_id: crmOrderId,
            preorder: this.customFields.isPreorder as boolean
        };
        return params;

    }

    /**
     * Convert kaspiOrderDeliveryMode to crmOrderDeliveryCode
     */
    private convertKaspiOrderDeliveryModeToCrmOrderDeliveryCode(kaspiOrderDeliveryMode: string): string | null {
        switch (kaspiOrderDeliveryMode) {
            case 'DELIVERY_REGIONAL_PICKUP':
            case 'DELIVERY_PICKUP':
                return '2';
            case 'DELIVERY_REGIONAL_TODOOR':
            case 'DELIVERY_LOCAL':
                return '1';
            default:
                return '3';
        }
    }

    /**
     * Convert payment type
     */
    private convertKaspiOrderPaymentTypeToCrmOrderPaymentType(kaspiPaymentType: string): string | null {
        this.customFields.systemComment = dayjs().format('DD.MM.YYYY HH:mm:ss') + ' SAP: Автоматическое создание заказа \n';
        switch (kaspiPaymentType) {
            case 'PAY_WITH_CREDIT':
                return '6';
            case 'PAY_IN_STORE':
                return '1';
            case 'PREPAID':
                this.customFields.sumOfPrepayment = this.totalPrice;
                this.customFields.systemComment += dayjs().format('DD.MM.YYYY HH:mm:ss') + ' SAP: Оплата Kaspi - кошелек, Kaspi Gold на сумму: '+ this.totalPrice + ' тенге  \n';
                return 'kaspi-beznal';
            default:
                return null;
        }
    }

}
