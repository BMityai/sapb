import ExportedOrdersInfoType from "../../Types/Crm/ExportedOrdersInfoType";
import OrderForExportType from "../../Types/Crm/OrderForExportType";
import OrderForSetWayBillLinkType from "../../Types/Kaspi/OrderForSetWayBillLinkType";
import ParamsForOrderStatusChangeInCrmType from "../../Types/Kaspi/ParamsForOrderStatusChangeInCrmType";

export default interface RetailCrmApiRepositoryInterface {
    /**
     * Export order to crm
     */
    exportOrder(order: OrderForExportType): Promise<ExportedOrdersInfoType>;

    /**
     * Sync order status to crm
     */
    changeOrderStatus(order: ParamsForOrderStatusChangeInCrmType): Promise<ParamsForOrderStatusChangeInCrmType>;
    /**
     * Set waybill link
     */
    setWayBillLink(order: OrderForSetWayBillLinkType): Promise<OrderForSetWayBillLinkType>;
}
