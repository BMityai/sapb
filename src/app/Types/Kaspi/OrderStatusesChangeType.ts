export default interface OrderStatusesChangeType {
    id: number;
    appStatus: string;
    kaspiStatus: string;
    crmStatus: string | null;
    kaspiState?: string;
}
