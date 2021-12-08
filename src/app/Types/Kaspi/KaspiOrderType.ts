import KaspiOrderAttributesType from "./KaspiOrderAttributesType";
import KaspiOrderEntriesType from "./KaspiOrderEntriesType";

export default interface KaspiOrderType {
    id: string;
    localOrderId?: number;
    attributes: KaspiOrderAttributesType;
    entriesLink: string;
    store: string;
    entries?: KaspiOrderEntriesType[];
}
