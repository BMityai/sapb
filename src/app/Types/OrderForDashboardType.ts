export default interface OrderForDashboardType {
    orderNumber: string;
    kaspiStatus: string;
    crmStatus: string;
    createdAt: string;
    updatedAt: string;
    data: {
        products: {
            name: string;
            xmlId: string;
            qty: number;
            price: number;
        }[],
        isExpress: boolean;
        exportedToCrmData: string;
        log: string[];
    }
}
