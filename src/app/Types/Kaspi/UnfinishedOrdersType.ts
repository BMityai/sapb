
export default interface UnfinishedOrdersType {
    id: number;
    crmId: number;
    appStatus: string;
    kaspiStatus: string;
    crmStatus: string | null;
    site: string;
    orderNumber: string;
    kaspiId: string;
    kaspiState?: string;
}