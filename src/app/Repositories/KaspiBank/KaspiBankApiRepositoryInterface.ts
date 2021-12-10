import LocalOrderItemType from "../../Types/Crm/LocalOrderItemType";
import OrderForChangeStatusType from "../../Types/Crm/OrderForChangeStatusType";
import KaspiOrderEntriesType from "../../Types/Kaspi/KaspiOrderEntriesType";
import KaspiOrderEntryDeliveryPointOfServiceType from "../../Types/Kaspi/KaspiOrderEntryDeliveryPointOfServiceType";
import KaspiOrderEntryMerchantProductType from "../../Types/Kaspi/KaspiOrderEntryMerchantProductType";
import KaspiOrderEntryProductType from "../../Types/Kaspi/KaspiOrderEntryProductType";
import KaspiOrderStatusType from "../../Types/Kaspi/KaspiOrderStatusType";
import KaspiOrderType from "../../Types/Kaspi/KaspiOrderType";
import ReturnRequestedOrReturnedOrderType from "../../Types/Kaspi/ReturnRequestedOrReturnedOrderType";

export default interface KaspiBankApiRepositoryInterface {

    /**
     * Get new orders from kaspi bank
     */
    getNewOrdersOfOneStore(store: string): Promise<KaspiOrderType[]>;

    /**
     * Get order entries
     */
    getOrderEntries(entriesLink: string, store: string): Promise<KaspiOrderEntriesType[]>;

    /**
     * Get entry product
     */
    getEntryProduct(productLink: string, store: string): Promise<KaspiOrderEntryProductType>;

    /**
     * Get entry delivery point of service
     */
    getEntryDeliveryPointOfService(deliveryPointOfServiceLink: string, store: string): Promise<KaspiOrderEntryDeliveryPointOfServiceType>;

    /**
     * Get order delivery point of services
     */
    getEntryDeliveryPointOfServices(entry: KaspiOrderEntriesType, store: string): Promise<KaspiOrderEntryDeliveryPointOfServiceType>;

    /**
     * Get order merchant product
     */
    getEntryMerchantProduct(merchantProductLink: string, store: string): Promise<KaspiOrderEntryMerchantProductType>;

    /**
     * Get order statuses by kaspiId from kaspi
     */
    getOrderStatusByKaspiId(kaspiId: string, site: string): Promise<KaspiOrderStatusType>;

    /**
     * Get return requested orders
     */
    getReturnRequestedOrdersPerStore(store: string): Promise<ReturnRequestedOrReturnedOrderType[] | []>;

    /**
     * Get returned orders
     */
    getReturnedOrdersPerStore(store: string): Promise<ReturnRequestedOrReturnedOrderType[] | []>;

    /**
     * Get order waybill link
     */
    getWaybillLinkByKaspiId(kaspiId: string, site: string): Promise<string | null>;

    /**
     * Change order status
     */
    changeOrderStatus(orderFromLocalDb: OrderForChangeStatusType): Promise<void>;

    /**
     * Update item qty
     */
    updateItemQty(item: LocalOrderItemType, site: string): Promise<void>;

    /**
     * Get order by number
     */
    getOrderByNumber(orderNumber: string, site: string): Promise<KaspiOrderType | null>;
}
