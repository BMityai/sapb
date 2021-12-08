export default interface KaspiOrderDeliveryAddressType {
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
