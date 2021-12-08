export default interface OrderForSetWayBillLinkType {
    id: number;
    crmId: number;
    kaspiStatus: string;
    crmStatus: string;
    site: string;
    orderNumber: string;
    kaspiId: string;
    kaspiState: string;
    wayBillLink: string | null;

}
