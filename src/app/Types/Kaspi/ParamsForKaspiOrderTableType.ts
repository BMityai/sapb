export default interface ParamsForKaspiOrderTableType {
    kaspiId: string;
    code: string;
    state: string;
    status: string;
    paymentMode: string;
    preorder: boolean;
    totalPrice: number;
    deliveryCost: number | null;
    signatureRequired: boolean;
    isKaspiDelivery: boolean;
    deliveryCostPrePaid: boolean | null;
    creditTerm: number | null;
    creationDate: string;
    approvedByBankDate: string;

    deliveryMode: string;
    deliveryAddress_streetName: string | null;
    deliveryAddress_streetNumber: string | null;
    deliveryAddress_town: string | null;
    deliveryAddress_district: string | null;
    deliveryAddress_building: string | null;
    deliveryAddress_formattedAddress: string | null;
    planned_delivery_date: string | null;
    reservation_date: string | null;
    waybill_link: string;

    order_id: number | null;

    created_at: Date;
    updated_at: Date;
}