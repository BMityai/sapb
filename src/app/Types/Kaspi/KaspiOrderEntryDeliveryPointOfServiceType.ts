export default interface KaspiOrderEntryDeliveryPointOfServiceType {
    id: string;
    attributes: {
        address: {
            streetName: string | null;
            streetNumber: string | null;
            town: string | null;
            district: string | null;
            building: string | null;
            apartment: string | null;
            formattedAddress: string | null;
            latitude: string | null;
            longitude: string | null;
        }
        displayName: string;
    };
    method?: string;
    entryId?: string;
}
