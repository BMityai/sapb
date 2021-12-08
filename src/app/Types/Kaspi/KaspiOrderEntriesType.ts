import KaspiOrderEntryDeliveryPointOfServiceType from "./KaspiOrderEntryDeliveryPointOfServiceType";
import KaspiOrderEntryProductType from "./KaspiOrderEntryProductType";

export default interface KaspiOrderEntriesType {
    id: string;
    attributes: {
        quantity: number;
        totalPrice: number;
        entryNumber: number;
        deliveryCost: number;
        basePrice: number;
    };
    productLink: string;
    deliveryPointOfServiceLink: string;
    product?: KaspiOrderEntryProductType;
    deliveryPointOfService?: KaspiOrderEntryDeliveryPointOfServiceType;
}
