import Database from 'sosise-core/build/Database/Database';
import LocalStorageRepositoryInterface from './LocalStorageRepositoryInterface';
import lodash, { isEmpty, isNull } from 'lodash';
import databaseConfig from '../../../config/database';
import KaspiOrderType from '../../Types/Kaspi/KaspiOrderType';
import OrderAppStatusesEnum from '../../Enums/OrderAppStatusesEnum';
import KaspiOrderStatusesEnum from '../../Enums/KaspiOrderStatusesEnum';
import dayjs from 'dayjs';
import ParamsForKaspiOrderProductsTableType from '../../Types/Kaspi/ParamsForKaspiOrderProductsTableType';
import KaspiOrderEntriesType from '../../Types/Kaspi/KaspiOrderEntriesType';
import ParamsForKaspiOrderMerchantProductsTableType from '../../Types/Kaspi/ParamsForKaspiOrderMerchantProductsTableType';
import ParamsForCrmOrderTableType from '../../Types/Crm/ParamsForCrmOrderTableType';
import ParamsForCrmOrderItemsTableType from '../../Types/Crm/ParamsForCrmOrderItemsTableType';
import ParamsForCrmOrderItemOffersTableType from '../../Types/Crm/ParamsForCrmOrderItemOffersTableType';
import ParamsForCrmOrderDeliveriesTableType from '../../Types/Crm/ParamsForCrmOrderDeliveriesTableType';
import ParamsForCrmOrderDeliveryServicesTableType from '../../Types/Crm/ParamsForCrmOrderDeliveryServicesTableType';
import ParamsForCrmOrderDeliveryAddressesTableType from '../../Types/Crm/ParamsForCrmOrderDeliveryAddressesTableType';
import ParamsForCrmOrderCustomFieldsTableType from '../../Types/Crm/ParamsForCrmOrderCustomFieldsTableType';
import OrderForExportType from '../../Types/Crm/OrderForExportType';
import OrderForExportProductType from '../../Types/Crm/OrderForExportProductType';
import UnfinishedOrdersType from '../../Types/Kaspi/UnfinishedOrdersType';
import OrderStatusesChangeType from '../../Types/Kaspi/OrderStatusesChangeType';
import KaspiOrderStatesEnum from '../../Enums/KaspiOrderStatesEnum';
import OrderForSetWayBillLinkType from '../../Types/Kaspi/OrderForSetWayBillLinkType';
import OrderNotFoundException from '../../Exceptions/OrderNotFoundException';
import OrderForChangeStatusType from '../../Types/Crm/OrderForChangeStatusType';
import Helper from 'sosise-core/build/Helper/Helper';
import CrmOrderItemType from '../../Types/Crm/LocalOrderItemType';
import LocalOrderItemType from '../../Types/Crm/LocalOrderItemType';



export default class LocalStorageRepository implements LocalStorageRepositoryInterface {


    private TOWNS_STORES = {
        'г. Алматы': 'kspim-r-01',
        'г. Астана': 'imas-o-05',
        'г. Нур-Султан': 'imas-o-05',
        'Алматы': 'kspim-r-01',
        'Астана': 'imas-o-05',
        'Нур-Султан': 'imas-o-05'
        // Add new mapping
    };

    private TOWNS_SERVICES = {
        'г. Алматы': 'im-r-15-kaspi',
        'Алматы': 'im-r-15-kaspi',

        'г. Астана': 'imas-o-05-kr',
        'Астана': 'imas-o-05-kr',

        'г. Нур-Султан': 'imas-o-05-kr',
        'Нур-Султан': 'imas-o-05-kr',
        // Add new mapping
    };

    /**
     * Shipment stores (for convert to crm order)
     */
    private KAPSI_ORDER_DELIVERY_POINT_MEGA = 'aa-r-164';
    private KAPSI_ORDER_DELIVERY_POINT_KOMFORT = 'kdaa-r-13';
    private KAPSI_ORDER_DELIVERY_POINTS = {
        'AAR01': this.KAPSI_ORDER_DELIVERY_POINT_MEGA,
        'KFMR03': this.KAPSI_ORDER_DELIVERY_POINT_KOMFORT,
        'KFUKR05': this.KAPSI_ORDER_DELIVERY_POINT_KOMFORT,
    };

    /**
     * Delivery services (for convert to crm order)
     */
    private KAPSI_ORDER_DELIVERY_SERVICE_MEGA = 'aa-r-164-ks-kaspi';
    private KAPSI_ORDER_DELIVERY_SERVICE_KOMFORT = 'kdaa-r-02-ks-kaspi';
    private KAPSI_ORDER_DELIVERY_SERVICES = {
        'AAR01': this.KAPSI_ORDER_DELIVERY_SERVICE_MEGA,
        'KFMR03': this.KAPSI_ORDER_DELIVERY_SERVICE_KOMFORT,
        'KFUKR05': this.KAPSI_ORDER_DELIVERY_SERVICE_KOMFORT,
    };


    private dbConnection: Database;

    constructor() {
        this.dbConnection = Database.getConnection(databaseConfig.default as string);
    }

    /**
     * Save new orders from kaspi
     */
    public async saveKaspiOrder(order: KaspiOrderType): Promise<void> {
        // Save order
        await this.dbConnection.client.transaction(async trx => {

            // Save to order table
            const orderId = await trx('orders').insert({
                appStatus: OrderAppStatusesEnum.new,
                kaspiStatus: order.attributes.status,
                site: order.store,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Save to kaspi_order table
            const kaspiOrderId = await trx('kaspi_orders').insert({
                kaspiId: order.id,
                code: order.attributes.code,
                state: order.attributes.state,
                status: order.attributes.status,
                paymentMode: order.attributes.paymentMode,
                preorder: order.attributes.preOrder,
                totalPrice: order.attributes.totalPrice,
                deliveryCost: order.attributes.deliveryCost,
                signatureRequired: order.attributes.signatureRequired,
                isKaspiDelivery: order.attributes.isKaspiDelivery,
                deliveryCostPrePaid: order.attributes.deliveryCostPrePaid,
                creditTerm: order.attributes.creditTerm,
                creationDate: dayjs(order.attributes.creationDate).format('YYYY-MM-DDTHH:mm:ss'),
                approvedByBankDate: dayjs(order.attributes.approvedByBankDate).format('YYYY-MM-DDTHH:mm:ss'),

                deliveryMode: order.attributes.deliveryMode,
                deliveryAddress_streetName: order.attributes.deliveryAddress.streetName,
                deliveryAddress_streetNumber: order.attributes.deliveryAddress.streetNumber,
                deliveryAddress_town: order.attributes.deliveryAddress.town,
                deliveryAddress_district: order.attributes.deliveryAddress.district,
                deliveryAddress_building: order.attributes.deliveryAddress.building,
                deliveryAddress_formattedAddress: order.attributes.deliveryAddress.formattedAddress,
                planned_delivery_date: order.attributes.plannedDeliveryDate,
                reservation_date: order.attributes.reservationDate,
                waybill_link: order.attributes.kaspiDelivery.waybill,

                order_id: orderId,
                is_express: order.attributes.kaspiDelivery.express,

                created_at: new Date(),
                updated_at: new Date()
            });

            order.localOrderId = orderId[0];
            // Save customer
            await trx('kaspi_order_customers').insert({
                kaspiId: order.attributes.customer.id,
                name: order.attributes.customer.name,
                firstName: order.attributes.customer.firstName,
                lastName: order.attributes.customer.lastName,
                cellPhone: order.attributes.customer.cellPhone,
                kaspi_order_id: kaspiOrderId,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Save products
            const firstProductId = await trx('kaspi_order_products').insert(this.prepareParamsForKaspiOrderProductsTable(order.entries!, kaspiOrderId[0]));


            // Save merchant products
            await trx('kaspi_order_merchant_products').insert(this.getParamsForKaspiOrderMerchantProductsTable(order.entries!, firstProductId[0]));

            // Save delivery point of service
            const kaspiOrderDeliveryPoinOfService = await trx('kaspi_order_delivery_point_of_services').insert({
                kaspiId: order.entries ? order.entries[0].deliveryPointOfService?.id : null,
                displayName: order.entries ? order.entries[0].deliveryPointOfService?.attributes.displayName : null,
                kaspi_order_id: kaspiOrderId,
                created_at: new Date(),
                updated_at: new Date()
            });

            // Save deliveryPointOfServiceAddresses
            await trx('kaspi_order_delivery_point_of_service_addresses').insert({
                streetName: order.entries ? order.entries[0].deliveryPointOfService?.attributes.address.streetName : null,
                streetNumber: order.entries ? order.entries[0].deliveryPointOfService?.attributes.address.streetNumber : null,
                town: order.entries ? order.entries[0].deliveryPointOfService?.attributes.address.town : null,
                district: order.entries ? order.entries[0].deliveryPointOfService?.attributes.address.district : null,
                building: order.entries ? order.entries[0].deliveryPointOfService?.attributes.address.building : null,
                formattedAddress: order.entries ? order.entries[0].deliveryPointOfService?.attributes.address.formattedAddress : null,
                kaspi_order_delivery_point_of_service_id: kaspiOrderDeliveryPoinOfService,
                created_at: new Date(),
                updated_at: new Date()
            });
        });
    }

    /**
     * Get order from kaspi_order table by kaspiId
     */
    public async getOrderByKaspiId(kaspiId: string): Promise<any> {
        // Get order
        const order = await this.dbConnection.client
            .table('kaspi_orders')
            .select([
                'orders.appStatus',
                'orders.id',
                'crm_orders.crmId',
                'crm_orders.status as crmOrderStatus',
                'crm_orders.number as orderNumber',
                'orders.site',
                'kaspi_orders.kaspiId',
                'kaspi_orders.state as kaspiState',
                'kaspi_orders.status as kaspiOrderStatus',
            ])
            .innerJoin('crm_orders', 'kaspi_orders.order_id', 'crm_orders.order_id')
            .innerJoin('orders', 'kaspi_orders.order_id', 'orders.id')
            .where('kaspiId', kaspiId)
            .first();

        // Check is empty
        if (!order) {
            return null;
        }

        return order;
    }

    /**
     * Set waybill link
     */
    public async setWayBillLink(order: OrderForSetWayBillLinkType): Promise<void> {
        await this.dbConnection.client
            .table('crm_orders')
            .where('number', order.orderNumber)
            .update({
                'waybill_link': order.wayBillLink,
                'updated_at': new Date(),
            });
    }

    /**
     * Convert and save new orders from kaspi
     */
    public async saveCrmOrder(order: KaspiOrderType): Promise<void> {
        // Get shipment store and delivery service
        const deliveryData = await this.getShipmentStoreAndSetDeliveryService(order);

        await this.dbConnection.client.transaction(async trx => {

            // Change crmStatus in 'orders' table
            await trx('orders').where('id', order.localOrderId).update({
                crmStatus: 'converted',
                updated_at: new Date()
            });

            // Prepare params for 'crm_order' table
            const paramsForCrmOrder = await this.getParamsForCrmOrderTable(order, deliveryData.deliveryPointOfService);

            // Save crmOrder
            const crmOrderId = await trx('crm_orders').insert(paramsForCrmOrder);

            // Prepare params for 'crm_order_items' table
            const paramsForCrmOrderItems = this.getParamsForCrmOrderItemsTable(order.entries!, crmOrderId[0]);
            // Save crmOrderItems
            const crmOrderFirstItemId = await trx('crm_order_items').insert(paramsForCrmOrderItems);

            // Prepare params for 'crm_order_item_offers' table
            const paramsForCrmOrderItemOffers = this.getParamsForCrmOrderItemOffersTable(order.entries!, crmOrderFirstItemId[0]);
            // Save crmOrderItemOffers
            await trx('crm_order_item_offers').insert(paramsForCrmOrderItemOffers);

            // Prepare params for 'crm_order_delivery_services' table
            const paramsForCrmOrderDeliveries = this.getParamsForCrmOrderDeliveries(order, crmOrderId[0]);
            // Save crmOrderDelivery
            const crmOrderDeliveryId = await trx('crm_order_deliveries').insert(paramsForCrmOrderDeliveries);

            // Prepare params for 'crm_order_delivery_services' table
            const paramsForCrmOrderDeliveryServices = this.getParamsForCrmOrderDeliveryServicesTable(crmOrderDeliveryId[0], deliveryData.deliveryServiceCode);
            // Save crmOrderDeliveryService
            await trx('crm_order_delivery_services').insert(paramsForCrmOrderDeliveryServices);

            // Prepare params for 'crm_order_delivery_addresses' table
            const crmOrderDeliveryAddresses = this.getParamsForCrmOrderDeliveryAddressesTable(order.entries!, crmOrderDeliveryId[0]);
            // Save crmOrderDeliveryAddresses
            await trx('crm_order_delivery_addresses').insert(crmOrderDeliveryAddresses);

            // Prepare params for 'crm_order_custom_fields' table
            const paramsForCrmOrderCustomFields = this.getParamsForCrmOrderCustomFields(order, crmOrderId[0]);
            await trx('crm_order_custom_fields').insert(paramsForCrmOrderCustomFields);

            // Log
            await trx('order_log').insert({
                order_id: order.localOrderId,
                level: 'info',
                text: 'Import order',
                created_at: new Date(),
                updated_at: new Date()
            });
        });
    }

    /**
     * Get order crm status by kaspi status (from mapping table)
     */
    public async getOrderCrmStatusByKaspiStatus(kaspiStatus: string): Promise<string | null> {
        const warehouse = await this.dbConnection.client
            .table('status_mapping')
            .where('kaspi_status', kaspiStatus)
            .first();

        return lodash.get(warehouse, 'crm_status', null);
    }

    /**
     * Get order kaspi status by crm status (from mapping table)
     */
    public async getOrderKaspiStatusByCrmStatus(crmStatus: string): Promise<string | null> {
        const warehouse = await this.dbConnection.client
            .table('status_mapping')
            .where('crm_status', crmStatus)
            .first();

        return lodash.get(warehouse, 'kaspi_status', null);
    }

    /**
     * Get order by number
     */
    public async getOrderByNumber(orderNumber: string): Promise<OrderForChangeStatusType | null> {

        // Get order
        const order = await this.dbConnection.client
            .table('crm_orders')
            .select([
                'orders.appStatus',
                'orders.id',
                'crm_orders.crmId',
                'crm_orders.status as crmOrderStatus',
                'crm_orders.number as orderNumber',
                'orders.site',
                'kaspi_orders.kaspiId',
                'kaspi_orders.state as kaspiState',
                'kaspi_orders.status as kaspiOrderStatus',
            ])
            .innerJoin('kaspi_orders', 'crm_orders.order_id', 'kaspi_orders.order_id')
            .innerJoin('orders', 'crm_orders.order_id', 'orders.id')
            .where('crm_orders.number', orderNumber)
            .first();

        // Check is empty
        if (!order) {
            return null;
        }

        return order;
    }

    /**
     * Get order items by order number
     */
    public async getOrderItemsByOrderNumber(orderNumber: string): Promise<CrmOrderItemType[]> {

        // Get order
        const items = await this.dbConnection.client
            .table('crm_orders')
            .select([
                'crm_order_items.quantity as qty',
                'crm_order_item_offers.xmlId as xmlId',
                'kaspi_order_products.entries_kaspi_id as entriesKaspiId',
            ])
            .innerJoin('crm_order_items', 'crm_orders.id', 'crm_order_items.crm_order_id')
            .innerJoin('crm_order_item_offers', 'crm_order_items.id', 'crm_order_item_offers.crm_order_item_id')
            .innerJoin('kaspi_order_merchant_products', 'crm_order_item_offers.xmlId', 'kaspi_order_merchant_products.code')
            .innerJoin('kaspi_order_products', 'kaspi_order_merchant_products.kaspi_order_product_id', 'kaspi_order_products.id')
            .where('crm_orders.number', orderNumber);

        return items;
    }

    /**
     * Update item qty
     */
    public async updateItemQty(item: LocalOrderItemType): Promise<void> {

        // Update qty
        await this.dbConnection.client
            .table('kaspi_order_products')
            .innerJoin('kaspi_order_merchant_products', 'kaspi_order_products.id', 'kaspi_order_merchant_products.kaspi_order_product_id')
            .innerJoin('crm_order_item_offers', 'kaspi_order_merchant_products.code', 'crm_order_item_offers.xmlId')
            .innerJoin('crm_order_items', 'crm_order_item_offers.crm_order_item_id', 'crm_order_items.id')
            .where('kaspi_order_products.entries_kaspi_id', item.entriesKaspiId)
            .update({
                'crm_order_items.quantity': item.qty,
                'crm_order_items.updated_at': new Date(),

                'kaspi_order_products.quantity': item.qty,
                'kaspi_order_products.updated_at': new Date()
            });
    }

    /**
     * Get orders to export
     */
    public async getOrdersToExport(): Promise<OrderForExportType[] | []> {
        const selectValues = [
            'orders.id',

            // from 'crm_order' table
            'crm_orders.id as crmOrderId',
            'crm_orders.site as store',
            'crm_orders.orderMethod',
            'crm_orders.status',
            'crm_orders.number',
            'crm_orders.phone',
            'crm_orders.id_ls as idLs',
            'crm_orders.firstName',
            'crm_orders.paymentType',
            'crm_orders.shipmentStore',
            'crm_orders.order_id as orderId',
            'crm_orders.planned_delivery_date as plannedDeliveryDate',
            'crm_orders.reservation_date as reservationDate',

            // from 'crm_order_deliveries' table
            'crm_order_deliveries.code as deliveryCode',
            'crm_order_deliveries.cost as deliveryCost',

            // from 'crm_order_delivery_services' table
            'crm_order_delivery_services.code as deliveryServiceCode',

            // from 'crm_order_delivery_addresses' table
            'crm_order_delivery_addresses.text as deliveryAdressText',
            'crm_order_delivery_addresses.notes as deliveryAdressNotes',

            // from 'crm_order_custom_fields' table
            'crm_order_custom_fields.kaspi_order_id as kaspiOrderId',
            'crm_order_custom_fields.sum_of_prepayment as sumOfPrepayment',
            'crm_order_custom_fields.system_comment as systemComment',
            'crm_order_custom_fields.shipping_cost_in_payment_flag as shippingCostInPaymentFlag',
            'crm_order_custom_fields.preorder',
        ];

        // Get new orders
        const orders = await this.dbConnection.client
            .table('orders')
            .select(selectValues)
            .innerJoin('crm_orders', 'orders.id', 'crm_orders.order_id')
            .innerJoin('crm_order_custom_fields', 'crm_orders.id', 'crm_order_custom_fields.crm_order_id')
            .innerJoin('crm_order_deliveries', 'crm_orders.id', 'crm_order_deliveries.crm_order_id')
            .innerJoin('crm_order_delivery_services', 'crm_order_deliveries.id', 'crm_order_delivery_services.crm_order_delivery_id')
            .innerJoin('crm_order_delivery_addresses', 'crm_order_deliveries.id', 'crm_order_delivery_addresses.crm_order_delivery_id')
            .where('orders.crmStatus', 'converted');

        if (isEmpty(orders)) {
            return [];
        }

        // Typecast
        const preparedOrders = new Array();
        for (const order of orders) {
            const typedOrder: OrderForExportType = {
                id: order.id,
                site: order.store,
                orderMethod: order.orderMethod,
                number: order.number,
                phone: order.phone,
                firstName: order.firstName,
                payments: [{ type: order.paymentType }],
                shipmentStore: order.shipmentStore,
                // Set custom fields
                customFields: {
                    sum_of_prepayment: order.sumOfPrepayment,
                    shipping_cost_in_payment_flag: order.shippingCostInPaymentFlag,
                    system_comment: order.systemComment,
                    reference_id: order.kaspiOrderId,
                    preorder: order.preorder,
                    customer_id_sl: order.idLs,
                    order_declared_delivery_date: this.getFormattedDate(order.plannedDeliveryDate),
                    order_reservation_date: this.getFormattedDate(order.reservationDate),
                    invoice_link: null
                },
                delivery: {
                    code: order.deliveryCode,
                    cost: order.deliveryCost,
                    netCost: 0,
                    service: {
                        code: order.deliveryServiceCode
                    },
                    address: {
                        text: order.deliveryAdressText,
                        notes: order.deliveryAdressNotes
                    }
                },
                items: await this.getExportOrderItems(order.crmOrderId)
            };
            preparedOrders.push(typedOrder);
        }

        return preparedOrders;
    }

    /**
     * Logging order process history
     */
    public async log(orderId: number, level: 'info' | 'error' | 'critical', text: string): Promise<void> {
        await this.dbConnection.client.table('order_log').insert({
            order_id: orderId,
            level,
            text,
            created_at: new Date(),
            updated_at: new Date()
        });
    }

    /**
     * Update exported order status
     */
    public async updateExportedOrderStatus(orderId: number): Promise<void> {

        const crmStatus = await this.getOrderCrmStatusByKaspiStatus(KaspiOrderStatusesEnum.approved);
        await this.dbConnection.client.transaction(async trx => {

            // Change crmStatus in 'orders' table
            await trx('orders').where('id', orderId).update({
                appStatus: OrderAppStatusesEnum.processing,
                crmStatus,
                updated_at: new Date()
            });

            // Change crmStatus in 'orders' table
            await trx('crm_orders').where('order_id', orderId).update({
                status: crmStatus,
                updated_at: new Date()
            });
        });
    }

    /**
     * Set crmId to crm order
     */
    public async setCrmIdToCrmOrder(orderId: number, crmId: number): Promise<void> {
        await this.dbConnection.client.table('crm_orders').where('order_id', orderId).update({
            crmid: crmId,
            updated_at: new Date()
        });
    }

    /**
     * Get unfinished orders for get changes from kaspi
     */
    public async getUnfinishedOrders(): Promise<UnfinishedOrdersType[]> {
        const orders = await this.dbConnection.client
            .table('orders')
            .select([
                'orders.id',
                'orders.appStatus',
                'orders.kaspiStatus',
                'orders.crmStatus',
                'crm_orders.site',
                'crm_orders.crmId',
                'crm_orders.number',
                'kaspi_orders.kaspiId'
            ])
            .innerJoin('crm_orders', 'orders.id', 'crm_orders.order_id')
            .innerJoin('kaspi_orders', 'orders.id', 'kaspi_orders.order_id')
            .whereNotIn('appStatus', [OrderAppStatusesEnum.canceled, OrderAppStatusesEnum.completed])
            .whereNot('crmStatus', 'converted');  // filtering non-exported order

        // Typecast orders
        const typedOrders = new Array();
        for (const order of orders) {
            const typedOrder: UnfinishedOrdersType = {
                id: order.id,
                crmId: order.crmId,
                appStatus: order.appStatus,
                kaspiStatus: order.kaspiStatus,
                crmStatus: order.crmStatus,
                site: order.site,
                orderNumber: order.number,
                kaspiId: order.kaspiId,
                kaspiState: order
            };
            typedOrders.push(typedOrder);
        }

        return typedOrders;
    }

    /**
     * Update order statuses
     */
    public async updateOrderStatuses(order: OrderStatusesChangeType): Promise<void> {
        await this.dbConnection.client.transaction(async trx => {

            // Change statuses in 'orders' table
            await trx('orders').where('id', order.id).update({
                appStatus: order.appStatus,
                crmStatus: order.crmStatus,
                kaspiStatus: order.kaspiStatus,
                updated_at: new Date()
            });

            // Change statuses in 'kaspi_orders' table
            await trx('kaspi_orders').where('order_id', order.id).update({
                status: order.kaspiStatus,
                state: order.kaspiState,
                updated_at: new Date()
            });

            // Change statuses in 'crm_orders' table
            await trx('crm_orders').where('order_id', order.id).update({
                status: order.crmStatus,
                updated_at: new Date()
            });
        });

    }

    /**
     * Get without waybill link orders
     */
    public async getWithoutWayBillLinkOrders(): Promise<OrderForSetWayBillLinkType[]> {

        return await this.dbConnection.client
            .table('crm_orders')
            .select([
                'orders.id',
                'crm_orders.crmId',
                'crm_orders.status as crmStatus',
                'crm_orders.site',
                'crm_orders.number as orderNumber',
                'crm_orders.waybill_link as wayBillLink',
                'kaspi_orders.status as kaspiStatus',
                'kaspi_orders.state as kaspiState',
                'kaspi_orders.kaspiId'
            ])
            .innerJoin('kaspi_orders', 'crm_orders.order_id', 'kaspi_orders.order_id')
            .innerJoin('orders', 'crm_orders.order_id', 'orders.id')
            .where('crm_orders.waybill_link ', null)
            .where('kaspi_orders.state', KaspiOrderStatesEnum.kaspiDelivery)
            .whereNotIn('kaspi_orders.status', [KaspiOrderStatusesEnum.canceled, KaspiOrderStatusesEnum.completed]);
    }

    /**
     * Change order status in Crm
     */
    public async changeOrderStatuses(order: OrderForChangeStatusType): Promise<void> {

        let cancellationReason: string | null = null;

        if (order.kaspiOrderStatus === KaspiOrderStatusesEnum.canceled || order.kaspiOrderStatus === KaspiOrderStatusesEnum.canceling) {
            cancellationReason = 'MERCHANT_OUT_OF_STOCK';
        }

        // Save order
        this.dbConnection.client.table('crm_orders')
            .innerJoin('orders', 'crm_orders.order_id', 'orders.id')
            .innerJoin('kaspi_orders', 'orders.id', 'kaspi_orders.order_id')
            .where('crm_orders.number', order.orderNumber)
            .update({
                'orders.crmStatus': order.crmOrderStatus,
                'orders.kaspiStatus': order.kaspiOrderStatus,
                'orders.appStatus': order.appStatus,
                'orders.updated_at': new Date(),

                'kaspi_orders.status': order.kaspiOrderStatus,
                'kaspi_orders.state': order.kaspiState,
                'kaspi_orders.cancellationReason': cancellationReason,
                'kaspi_orders.updated_at': new Date(),

                'crm_orders.status': order.crmOrderStatus,
                'crm_orders.updated_at': new Date(),
            });
    }

    /**
     * Get order products for export
     */
    private async getExportOrderItems(crmOrderId: string): Promise<OrderForExportProductType[]> {
        const products = await this.dbConnection.client
            .table('crm_order_items')
            .select(['crm_order_items.quantity', 'crm_order_items.initialPrice', 'crm_order_item_offers.xmlId'])
            .innerJoin('crm_order_item_offers', 'crm_order_items.id', 'crm_order_item_offers.crm_order_item_id')
            .where('crm_order_items.crm_order_id', crmOrderId);

        // Typecast
        const typedProducts = new Array();
        for (const product of products) {
            const typedProduct: OrderForExportProductType = {
                quantity: product.quantity,
                initialPrice: product.initialPrice,
                offer: { xmlId: product.xmlId }

            };
            typedProducts.push(typedProduct);

        }
        return typedProducts;
    }

    /**
     * Prepare params for kaspi_order_products table
     */
    private prepareParamsForKaspiOrderProductsTable(entries: KaspiOrderEntriesType[], kaspiOrderId: number): ParamsForKaspiOrderProductsTableType[] {
        const products = new Array();

        for (const entry of entries) {
            products.push({
                kaspiId: entry.product?.id,
                code: entry.product?.attributes.code,
                name: entry.product?.attributes.name,
                manufacturer: entry.product?.merchantProduct?.attributes.manufacturer,
                quantity: entry.attributes.quantity,
                price: entry.attributes.basePrice,
                entries_kaspi_id: entry.id,
                kaspi_order_id: kaspiOrderId,
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        return products;
    }

    /**
     * Prepare params for kaspi_order_merchant_products table
     */
    private getParamsForKaspiOrderMerchantProductsTable(entries: KaspiOrderEntriesType[], kaspiOrderFirstProductId: number): ParamsForKaspiOrderMerchantProductsTableType[] {
        const products = new Array();

        for (const entry of entries) {
            products.push({
                kaspiId: entry.product?.merchantProduct?.id,
                code: entry.product?.merchantProduct?.attributes.code,
                name: entry.product?.merchantProduct?.attributes.name,
                manufacturer: entry.product?.merchantProduct?.attributes.manufacturer,
                kaspi_order_product_id: kaspiOrderFirstProductId,

                created_at: new Date(),
                updated_at: new Date()
            });
            kaspiOrderFirstProductId++;
        }

        return products;
    }

    /**
     * Get crm warehouse by kaspi warehouse (from mapping table)
     */
    private async getCrmWarehouseByKaspiWarehouseName(kaspiWarehouseName: string): Promise<string> {
        const warehouse = await this.dbConnection.client
            .table('warehouse_mapping')
            .where('kaspi_warehouse', kaspiWarehouseName)
            .first();

        return lodash.get(warehouse, 'crm_warehouse', '');
    }

    /**
     * Get shipment stores
     */
    private async getShipmentStoreAndSetDeliveryService(order: KaspiOrderType): Promise<{ deliveryServiceCode: string, deliveryPointOfService: string }> {
        const convertedResult = {
            deliveryServiceCode: '',
            deliveryPointOfService: ''
        };

        const deliveryPoitOfService = order.entries ? order.entries[0].deliveryPointOfService : null;

        switch (order.attributes.deliveryMode) {
            case 'DELIVERY_REGIONAL_PICKUP':
            case 'DELIVERY_PICKUP':
                const crmWarehouse = await this.getCrmWarehouseByKaspiWarehouseName(deliveryPoitOfService?.attributes.displayName!);

                // Set crm order delivery service code
                convertedResult.deliveryServiceCode = crmWarehouse;

                // Set crm order shipment store
                convertedResult.deliveryPointOfService = crmWarehouse;
                break;

            case 'DELIVERY_REGIONAL_TODOOR':
            case 'DELIVERY_LOCAL':

                // Set crm order delivery service code
                convertedResult.deliveryServiceCode = this.TOWNS_SERVICES[deliveryPoitOfService?.attributes.address.town as string] ?? '';

                // Set crm order shipment store
                convertedResult.deliveryPointOfService = this.TOWNS_STORES[deliveryPoitOfService?.attributes.address.town as string] ?? '';

                break;
            default:  // default == kaspiDelivery

                // Set crm order delivery service code
                convertedResult.deliveryServiceCode = this.KAPSI_ORDER_DELIVERY_SERVICES[deliveryPoitOfService?.attributes.address.town as string]
                    ?? this.KAPSI_ORDER_DELIVERY_SERVICE_MEGA;

                // Return crm order shipment store
                convertedResult.deliveryPointOfService = this.KAPSI_ORDER_DELIVERY_POINTS[deliveryPoitOfService?.attributes.displayName as string] ?? this.KAPSI_ORDER_DELIVERY_POINT_MEGA;
        }

        return convertedResult;
    }

    /**
     * Prepare params for crm_order_table
     */
    private async getParamsForCrmOrderTable(order: KaspiOrderType, shipmentStore: string): Promise<ParamsForCrmOrderTableType> {
        // Prepare params
        return {
            site: order.store,
            orderMethod: 'kaspi-kz',
            status: 'converted',
            number: `KSP-${order.attributes.code}`,
            phone: `+7${order.attributes.customer.cellPhone}`,
            id_ls: order.attributes.customer.idLs!,
            firstName: order.attributes.customer.name ?? order.attributes.customer.firstName!,
            paymentType: this.convertKaspiOrderPaymentTypeToCrmOrderPaymentType(order.attributes.paymentMode),
            shipmentStore,
            order_id: order.localOrderId!,
            planned_delivery_date: order.attributes.plannedDeliveryDate,
            reservation_date: order.attributes.reservationDate,
            waybill_link: order.attributes.kaspiDelivery.waybill,
            created_at: new Date(),
            updated_at: new Date()
        };
    }

    /**
     * Convert payment type
     */
    private convertKaspiOrderPaymentTypeToCrmOrderPaymentType(kaspiPaymentType: string): string {
        switch (kaspiPaymentType) {
            case 'PAY_WITH_CREDIT':
                return '6';
            case 'PAY_IN_STORE':
                return '1';
            case 'PREPAID':
                return 'kaspi-beznal';
            default:
                return '';
        }
    }


    /**
     * Prepare params for crm_order_items_table
     */
    private getParamsForCrmOrderItemsTable(entries: KaspiOrderEntriesType[], crmOrderId: number): ParamsForCrmOrderItemsTableType[] {
        const convertedItems = new Array();

        for (const entry of entries) {
            convertedItems.push({
                quantity: entry.attributes.quantity,
                initialPrice: entry.attributes.basePrice,
                crm_order_id: crmOrderId,
                created_at: new Date(),
                updated_at: new Date()
            });
        }

        return convertedItems;
    }

    /**
     * Prepare params for crm_order_item_offers_table
     */
    private getParamsForCrmOrderItemOffersTable(entries: KaspiOrderEntriesType[], crmOrderFirstItemId: number): ParamsForCrmOrderItemOffersTableType[] {
        // Prepare items
        const params = new Array();
        for (const entry of entries) {

            // Prepare per item
            const item: ParamsForCrmOrderItemOffersTableType = {
                xmlId: entry.product?.merchantProduct?.attributes.code!,
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
     * Prepare params for crm_order_deliveries table
     */
    private getParamsForCrmOrderDeliveries(order: KaspiOrderType, crmOrderId: number): ParamsForCrmOrderDeliveriesTableType {
        // Prepare params
        const params: ParamsForCrmOrderDeliveriesTableType = {
            code: this.convertKaspiOrderDeliveryModeToCrmOrderDeliveryCode(order.attributes.deliveryMode),
            cost: order.attributes.deliveryCost,
            crm_order_id: crmOrderId,
            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Convert kaspiOrderDeliveryMode to crmOrderDeliveryCode
     */
    private convertKaspiOrderDeliveryModeToCrmOrderDeliveryCode(kaspiOrderDeliveryMode: string): string {
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
     * Prepare params for crm_order_delivey_services table
     */
    private getParamsForCrmOrderDeliveryServicesTable(crmOrderDeliveryId: number, crmOrderDeliveryServiceCode: string): ParamsForCrmOrderDeliveryServicesTableType {
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
    private getParamsForCrmOrderDeliveryAddressesTable(entries: KaspiOrderEntriesType[], crmOrderDeliveryServiceId: number): ParamsForCrmOrderDeliveryAddressesTableType {
        const entry = entries[0] as KaspiOrderEntriesType;
        // Prepare params
        const params: ParamsForCrmOrderDeliveryAddressesTableType = {
            text: entry.deliveryPointOfService!.attributes.address.formattedAddress,
            notes: entry.deliveryPointOfService!.attributes.address.formattedAddress,
            crm_order_delivery_id: crmOrderDeliveryServiceId,
            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Get params for 'crm_order_custom_fields' table
     */
    private getParamsForCrmOrderCustomFields(order: KaspiOrderType, crmOrderId: number): ParamsForCrmOrderCustomFieldsTableType {

        // Prepare params
        const params: ParamsForCrmOrderCustomFieldsTableType = {
            kaspi_order_id: order.id,
            sum_of_prepayment: order.attributes.totalPrice,
            system_comment: this.prepareSystemComment(order),
            shipping_cost_in_payment_flag: order.attributes.deliveryCostPrePaid,
            crm_order_id: crmOrderId,
            preorder: order.attributes.preOrder,
            is_express: order.attributes.kaspiDelivery.express,
            created_at: new Date(),
            updated_at: new Date()
        };
        return params;
    }

    /**
     * Prepare system comment
     */
    private prepareSystemComment(order: KaspiOrderType): string {
        let systemComment = dayjs().format('DD.MM.YYYY HH:mm:ss') + ' SAP: Автоматическое создание заказа \n';

        if (order.attributes.paymentMode === 'PREPAID') {
            systemComment += `${dayjs().format('DD.MM.YYYY HH:mm:ss')} SAP: Оплата Kaspi - кошелек, Kaspi Gold на сумму: ${order.attributes.totalPrice} тенге  \n`;
        }

        return systemComment;
    }

    /**
     * Formatted date
     */
    private getFormattedDate(date: string | null): string | null {
        if (isNull(date)) {
            return null;
        }
        return dayjs(date).format('YYYY-MM-DD');
    }
}
