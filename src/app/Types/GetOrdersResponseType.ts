import OrderForDashboardType from "./OrderForDashboardType";

export default interface GetOrdersResponseType {
    totalRecords: number,
    orders: OrderForDashboardType[]
}
