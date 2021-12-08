import OrderForExportProductType from "./OrderForExportProductType";


export default interface OrderForExportType {
    id: number;
    site: string;
    orderMethod: string;
    number: string;
    phone: string;
    firstName: string;
    payments: { type: string }[];
    shipmentStore: string;

    // Order custom fields
    customFields: {
        sum_of_prepayment: number;
        shipping_cost_in_payment_flag: boolean;
        system_comment: string;
        reference_id: string;
        preorder: boolean;
        customer_id_sl: number;
        order_declared_delivery_date: string | null;
        order_reservation_date: string | null;
        invoice_link: string | null;
    };

    // Order delivery info
    delivery: {
        code: string;
        cost: number;
        netCost: number;
        service: {
            code: string;
        };
        address: {
            text: string;
            notes: string;
        }

    };

    items: OrderForExportProductType[];
}