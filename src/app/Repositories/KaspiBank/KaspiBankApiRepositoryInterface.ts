import OrderType from "../../Types/Kaspi/OrderType";

export default interface KaspiBankApiRepositoryInterface {

    /**
     * Get new orders from kaspi bank
     */
    getNewOrdersPerStore(store: string): Promise<OrderType[] | []>;

}
