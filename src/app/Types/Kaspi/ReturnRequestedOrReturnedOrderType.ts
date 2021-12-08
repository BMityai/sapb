export default interface ReturnRequestedOrReturnedOrderType
 {
    // Get from kaspi
    code: string;
    kaspiId: string;
    kaspiState: string;
    kaspiStatus: string;

    // // Concat from local order
    // appStatus?: string;
    // crmStatus?: string;
    // orderNumber?: string;
    // crmId?: string;
    // site?: string;
    // id?: number;
}