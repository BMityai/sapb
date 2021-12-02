export default interface ParamsForKaspiOrderMerchantProductsTableType {
    kaspiId: string;
    code: string;
    name: string;
    manufacturer: string | null;
    kaspi_order_product_id: number;

    created_at: Date;
    updated_at: Date;
}
