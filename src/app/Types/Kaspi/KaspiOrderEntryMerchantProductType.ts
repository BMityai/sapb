export default interface KaspiOrderEntryMerchantProductType {
    id: string;
    attributes: {
        code: string;
        name: string;
        manufacturer: string | null;
    };
}
