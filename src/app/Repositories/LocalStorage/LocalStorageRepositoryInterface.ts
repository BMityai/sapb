import LocalOrderItemType from "../../Types/Crm/LocalOrderItemType";
import CrmOrderItemType from "../../Types/Crm/LocalOrderItemType";
import OrderForChangeStatusType from "../../Types/Crm/OrderForChangeStatusType";
import OrderForExportType from "../../Types/Crm/OrderForExportType";
import KaspiOrderType from "../../Types/Kaspi/KaspiOrderType";
import OrderForSetWayBillLinkType from "../../Types/Kaspi/OrderForSetWayBillLinkType";
import OrderStatusesChangeType from "../../Types/Kaspi/OrderStatusesChangeType";
import UnfinishedOrdersType from "../../Types/Kaspi/UnfinishedOrdersType";

export default interface LocalStorageRepositoryInterface {

    /**
     * Get order from kaspi_order table by kaspiId
     */
    getOrderByKaspiId(kaspiId: string);

    /**
     * Save new orders from kaspi
     */
    saveKaspiOrder(order: KaspiOrderType): Promise<void>;

    /**
     * Get order crm status by kaspi status (from mapping table)
     */
    getOrderCrmStatusByKaspiStatus(kaspiStatus: string): Promise<string | null>;

    /**
     * Convert and save new orders from kaspi
     */
    saveCrmOrder(order: KaspiOrderType): Promise<void>;

    /**
     * Get orders to export
     */
    getOrdersToExport(): Promise<OrderForExportType[] | []>;

    /**
     * Logging order process history
     */
    log(orderId: number, level: 'info' | 'error' | 'critical', text: string): Promise<void>;

    /**
     * Logging order process history
     */
    updateExportedOrderStatus(orderId: number): Promise<void>;

    /**
     * Set crmId to crm order
     */
    setCrmIdToCrmOrder(orderId: number, crmId: number): Promise<void>;

    /**
     * Get unfinished orders for get changes from kaspi
     */
    getUnfinishedOrders(): Promise<UnfinishedOrdersType[]>;

    /**
     * Update order statuses
     */
    updateOrderStatuses(order: OrderStatusesChangeType): Promise<void>;

    /**
     * Get without waybill link orders
     */
    getWithoutWayBillLinkOrders(): Promise<OrderForSetWayBillLinkType[]>;

    /**
     * Set waybill link
     */
    setWayBillLink(order: OrderForSetWayBillLinkType): Promise<void>;

    /**
     * Get order kaspi status by crm status (from mapping table)
     */
    getOrderKaspiStatusByCrmStatus(crmStatus: string): Promise<string | null>;

    /**
     * Get order by number
     */
    getOrderByNumber(orderNumber: string): Promise<OrderForChangeStatusType | null>;

    /**
     * Change order status in Crm
     */
    changeOrderStatuses(order: OrderForChangeStatusType): Promise<void>;

    /**
     * Get order items by order number
     */
    getOrderItemsByOrderNumber(orderNumber: string): Promise<CrmOrderItemType[]>;

    /**
     * Update item qty
     */
    updateItemQty(item: LocalOrderItemType): Promise<void>;
}
