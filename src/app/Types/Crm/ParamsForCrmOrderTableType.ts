export default interface ParamsForCrmOrderTableType {
    site: string;
    crmId?: number;
    orderMethod: string;
    status: string;
    number: string;
    phone: string;
    id_ls: number;
    firstName: string;
    paymentType: number | string;
    managerComment?: string;
    shipmentStore: string;
    order_id: number;
    planned_delivery_date: string | null;
    reservation_date: string | null;
    waybill_link: string | null;
    created_at: Date;
    updated_at: Date;
}