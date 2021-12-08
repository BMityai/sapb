import KaspiOrderCustomerType from "../../Types/Kaspi/KaspiOrderCustomerType";

export default interface LsApiRepositoryInterface {
    /**
     * Get customer id from loyalty system
     */
    getCustomerIdLs(order: KaspiOrderCustomerType): Promise<string | null>;
}
