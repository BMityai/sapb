export default interface ParamsForKaspiOrderProductsTableType {
    kaspiId: string;
    code: string;
    name: string;
    manufacturer: string | null;
    quantity: number;
    price: number;
    kaspi_order_id: number | null;
    created_at: Date;
    updated_at: Date
}
