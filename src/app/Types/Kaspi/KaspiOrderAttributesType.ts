import KaspiOrderCustomerType from "./KaspiOrderCustomerType";
import KaspiOrderDeliveryAddressType from "./KaspiOrderDeliveryAddressType";
import KaspiOrderKaspiDeliveryType from "./KaspiOrderKaspiDeliveryType";

export default interface KaspiOrderAttributesType {
    code: string;
    totalPrice: number;
    paymentMode: string;
    plannedDeliveryDate: string | null;
    creationDate: number;
    deliveryCostForSeller: number;
    isKaspiDelivery: boolean;
    deliveryCostPrePaid: boolean;
    deliveryMode: string;
    deliveryAddress: KaspiOrderDeliveryAddressType;
    signatureRequired: boolean;
    creditTerm: number;
    kaspiDelivery: KaspiOrderKaspiDeliveryType;
    preOrder: boolean;
    state: string;
    assembled: boolean;
    approvedByBankDate: number;
    status: string;
    customer: KaspiOrderCustomerType;
    deliveryCost: number;
    reservationDate: string | null;
}
