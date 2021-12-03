import KaspiOrderType from "../../Types/Kaspi/KaspiOrderType";

export default interface LocalStorageRepositoryInterface {

    /**
     * Get order from kaspi_order table by kaspiId
     */
    getOrderByKaspiId(kaspiId: string);

    /**
     * Save new orders from kaspi
     */
    saveKaspiOrder(order: KaspiOrderType): Promise<void>;
}
