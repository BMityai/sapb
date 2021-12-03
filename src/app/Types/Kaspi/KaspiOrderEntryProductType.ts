import KaspiOrderEntryMerchantProductType from "./KaspiOrderEntryMerchantProductType";

export default interface KaspiOrderEntryProductType {
    id: string;
    attributes: {
        code: string;
        name: number;
    }
    merchantProductLink: string;
    merchantProduct?: KaspiOrderEntryMerchantProductType;
    method?: string;
    entryId?: string;
}