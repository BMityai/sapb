export default interface ParamsForCrmOrderTableType {
    site: string;
    crmId: string | null;
    orderMethod: string;
    status: string;
    number: string;
    phone: string | null;
    id_ls: string | null;
    firstName: string | null;
    paymentType: string | null;
    managerComment: string | null;
    shipmentStore: string | null;
    order_id: number | null;
    planned_delivery_date :string | null;
    reservation_date: string | null;
    waybill_link: string | null;
    created_at: Date;
    updated_at: Date;
}
