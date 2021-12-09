import CrmOrderItemType from "./LocalOrderItemType";

export default interface OrderForChangeStatusType {
    id: number;
    orderNumber: string;
    site: string;
    crmId: number;
    kaspiId: string;
    appStatus: string;
    crmOrderStatus: string;
    kaspiOrderStatus: string;
    kaspiState: string;

    items?: CrmOrderItemType[];
}