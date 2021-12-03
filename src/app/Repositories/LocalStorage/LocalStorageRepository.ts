import Database from 'sosise-core/build/Database/Database';
import LocalStorageRepositoryInterface from './LocalStorageRepositoryInterface';
import { Knex } from 'knex';
import databaseConfig from '../../../config/database';
import KaspiOrderType from '../../Types/Kaspi/KaspiOrderType';
import OrderAppStatusesEnum from '../../Enums/OrderAppStatusesEnum';
import KaspiOrderStatusesEnum from '../../Enums/KaspiOrderStatusesEnum'
import dayjs from 'dayjs';
import ParamsForKaspiOrderProductsTableType from '../../Types/Kaspi/ParamsForKaspiOrderProductsTableType';
import KaspiOrderEntriesType from '../../Types/Kaspi/KaspiOrderEntriesType';
import ParamsForKaspiOrderMerchantProductsTableType from '../../Types/Kaspi/ParamsForKaspiOrderMerchantProductsTableType';
import Helper from 'sosise-core/build/Helper/Helper';



export default class LocalStorageRepository implements LocalStorageRepositoryInterface {


    private crmOrderDeliveryServiceCode: string = '';

    private TOWNS_STORES = {
        'г. Алматы': 'kspim-r-01',
        'г. Астана': 'imas-o-05',
        'г. Нур-Султан': 'imas-o-05',
        'Алматы': 'kspim-r-01',
        'Астана': 'imas-o-05',
        'Нур-Султан': 'imas-o-05'
        //Add new mapping
    }

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


    private dbConnection: Database

    constructor() {
        this.dbConnection = Database.getConnection(databaseConfig.default as string)
    }

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
            })

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

                created_at: new Date(),
                updated_at: new Date()
            });


            // Save customer
            await trx('kaspi_order_customers').insert({
                kaspiId: order.attributes.customer.id,
                name: order.attributes.customer.name,
                firstName: order.attributes.customer.firstName,
                lastName: order.attributes.customer.lastName,
                cellPhone: order.attributes.customer.cellPhone,
                kaspi_order_id: kaspiOrderId,
                created_at: new Date,
                updated_at: new Date
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
            })

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
            })
        })
    }

    /**
     * Get order from kaspi_order table by kaspiId
     */
    public async getOrderByKaspiId(kaspiId: string) {

        // Get order
        const order = await this.dbConnection.client
            .table('kaspi_orders')
            // .select([
            //     'crm_orders.crmId',
            //     'crm_orders.status as crmOrderStatus',
            //     'crm_orders.number as orderNumber',
            //     'orders.site',
            //     'kaspi_orders.kaspiId',
            //     'kaspi_orders.state as kaspiState',
            //     'kaspi_orders.status as kaspiOrderStatus',
            // ])
            // .innerJoin('crm_orders', 'kaspi_orders.order_id', 'crm_orders.order_id')
            // .innerJoin('orders', 'kaspi_orders.order_id', 'orders.id')
            .where('kaspiId', kaspiId)
            .first();

            // Check is empty
        if (!order) {
            return null;
        }

        return order;
    }

    /**
     * Prepare params for kaspi_order_products table
     */
    private prepareParamsForKaspiOrderProductsTable(entries: KaspiOrderEntriesType[], kaspiOrderId: number): ParamsForKaspiOrderProductsTableType[] {
        const products = new Array();

        for(const entry of entries) {
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
            })
        }

        return products;
    }

    /**
     * Prepare params for kaspi_order_merchant_products table
     */
    private getParamsForKaspiOrderMerchantProductsTable(entries: KaspiOrderEntriesType[], kaspiOrderFirstProductId: number): ParamsForKaspiOrderMerchantProductsTableType[] {
        const products = new Array();

        for(const entry of entries) {
            products.push({
                kaspiId: entry.product?.merchantProduct?.id,
                code: entry.product?.merchantProduct?.attributes.code,
                name: entry.product?.merchantProduct?.attributes.name,
                manufacturer: entry.product?.merchantProduct?.attributes.manufacturer,
                kaspi_order_product_id: kaspiOrderFirstProductId,
            
                created_at: new Date(),
                updated_at: new Date()
            })
            kaspiOrderFirstProductId ++;
        }

        return products;
    }
}
