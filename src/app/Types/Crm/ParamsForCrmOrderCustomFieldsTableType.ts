export default interface ParamsForCrmOrderCustomFieldsTableType {
    kaspi_order_id: string;
    sum_of_prepayment: number;
    system_comment: string;
    shipping_cost_in_payment_flag: boolean;
    crm_order_id: number;
    preorder: boolean;
    is_express: boolean;
    created_at: Date;
    updated_at: Date;
}
