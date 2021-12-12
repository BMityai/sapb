import AdminUserType from "../../../Types/AdminUserType";
import OrdersCountInfoType from "../../../Types/OrdersCountInfoType";
import SaveNewStatusesType from "../../../Types/SaveNewStatuseType";
import SaveNewWarehouseType from "../../../Types/SaveNewWarehouseType";
import StatusMappingType from "../../../Types/StatusMappingType";
import WarehouseMappingType from "../../../Types/WarehouseMappingType";
import CreateUserUnifier from "../../../Unifiers/Adminhtml/CreateUserUnifier";
import PrimevueTableParamsConverterUnifier from "../../../Unifiers/Adminhtml/PrimevueTableParamsConverterUnifier";

export default interface LocalStorageRepositoryInterface {

    /**
     * Get statuses
     */
    getStatuses(): Promise<StatusMappingType[]>;

    /**
     * Get users
     */
    getUsers(): Promise<AdminUserType[]>;

    /**
     * Create user
     */
    createUser(createUserunifier: CreateUserUnifier): Promise<void>;

    /**
     * Update user
     */
    updateUser(createUserunifier: CreateUserUnifier): Promise<AdminUserType>;

    /**
     * Get warehouses
     */
    getWarehouses(): Promise<WarehouseMappingType[]>;

    /**
     * Remove statuses by ids
     */
    removeStatusesByIds(ids: string[]): Promise<void>;

    /**
     * Update statuses
     */
    updateStatuses(data: any): Promise<void>;

    /**
     * Save new statuses
     */
    saveNewStatuses(data: SaveNewStatusesType[]): Promise<void>;

    /**
     * Remove warehouses by ids
     */
    removeWarehousesByIds(ids: string[]): Promise<void>;

    /**
     * Update warehouses
     */
    updateWarehouses(data: any): Promise<void>;

    /**
     * Save new warehouses
     */
    saveNewWarehouses(data: SaveNewWarehouseType[]): Promise<void>;

    /**
     * Get data on the number of orders for dashboard
     */
    getDataOnTheNumberOfOrders(): Promise<OrdersCountInfoType>;

    /**
     * Get all orders by month
     */
    getAllOrdersByMonth(currentMonthNumber: number): Promise<number[]>;

    /**
     * Get completed orders by month
     */
    getCompletedOrdersByMonth(currentMonthNumber: number): Promise<number[]>;

    /**
     * Get canceled orders by month
     */
    getCanceledOrdersByMonth(currentMonthNumber: number): Promise<number[]>;

    /**
     * Get orders
     */
    getOrders(params: PrimevueTableParamsConverterUnifier): Promise<any[]>;

}
