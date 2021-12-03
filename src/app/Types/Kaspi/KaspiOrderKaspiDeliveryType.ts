export default interface KaspiOrderKaspiDeliveryType {
    waybill: string | null;
    courierTransmissionDate: string | null;
    courierTransmissionPlanningDate: string | null;
    waybillNumber: string | null;
    express: boolean;
    returnedToWarehouse: boolean;
}