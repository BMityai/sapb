import ParamsForCrmOrderItemOffersTableType from "./ParamsForCrmOrderItemOffersTableType";
import ParamsForCrmOrderItemsTableType from "./ParamsForCrmOrderItemsTableType";
import ParamsForCrmOrderTableType from "./ParamsForCrmOrderTableType";

export default interface ConvertedCrmOrderType {
    paramsForCrmOrderTable: ParamsForCrmOrderTableType;
    paramsForCrmOrderItemsTable: ParamsForCrmOrderItemsTableType;
    paramsForCrmOrderItemOffersTable: ParamsForCrmOrderItemOffersTableType;
}
