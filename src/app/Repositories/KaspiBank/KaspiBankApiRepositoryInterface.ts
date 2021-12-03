import KaspiOrderEntriesType from "../../Types/Kaspi/KaspiOrderEntriesType";
import KaspiOrderEntryDeliveryPointOfServiceType from "../../Types/Kaspi/KaspiOrderEntryDeliveryPointOfServiceType";
import KaspiOrderEntryMerchantProductType from "../../Types/Kaspi/KaspiOrderEntryMerchantProductType";
import KaspiOrderEntryProductType from "../../Types/Kaspi/KaspiOrderEntryProductType";
import KaspiOrderType from "../../Types/Kaspi/KaspiOrderType";

export default interface KaspiBankApiRepositoryInterface {

    /**
     * Get new orders from kaspi bank
     */
    getNewOrdersOfOneStore(store: string): Promise<KaspiOrderType[]>;

    /**
     * Get order entries
     */
    getOrderEntries(entriesLink: string, store: string): Promise<KaspiOrderEntriesType[]>;

    /**
     * Get entry product
     */
    getEntryProduct(productLink: string, store: string): Promise<KaspiOrderEntryProductType>;

    /**
     * Get entry delivery point of service
     */
    getEntryDeliveryPointOfService(deliveryPointOfServiceLink: string, store: string): Promise<KaspiOrderEntryDeliveryPointOfServiceType>;

    /**
     * Get order delivery point of services
     */
    getEntryDeliveryPointOfServices(entry: KaspiOrderEntriesType, store: string): Promise<KaspiOrderEntryDeliveryPointOfServiceType>;

    /**
     * Get order merchant product
     */
    getEntryMerchantProduct(merchantProductLink: string, store: string): Promise<KaspiOrderEntryMerchantProductType>;

}
