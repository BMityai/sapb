import { isNull } from "lodash";
import Helper from "sosise-core/build/Helper/Helper";
import IOC from "sosise-core/build/ServiceProviders/IOC";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import KaspiBankApiRepositoryInterface from "../Repositories/KaspiBank/KaspiBankApiRepositoryInterface";
import LocalStorageRepositoryInterface from "../Repositories/LocalStorage/LocalStorageRepositoryInterface";
import RetailCrmApiRepositoryInterface from "../Repositories/RetailCrm/RetailCrmApiRepositoryInterface";
import CrmOrderItemType from "../Types/Crm/CrmOrderItemType";
import LocalOrderItemType from "../Types/Crm/LocalOrderItemType";
import OrderForChangeStatusType from "../Types/Crm/OrderForChangeStatusType";
import OrderPartialCancellationUnifier from "../Unifiers/OrderPartialCancellationUnifier";

export default class PartialCancellationService {

    protected localStorageRepository: LocalStorageRepositoryInterface;
    protected kaspiBankApiRepository: KaspiBankApiRepositoryInterface;
    protected retailCrmApiRepository: RetailCrmApiRepositoryInterface;
    protected logger: LoggerService;

    protected ITEMS_CANCELLATION_STATUSES = [
        'niet-nighdie-na-ostatkakh',
        'otmienien-nie-ponravilsia-tovar',
        'otmienien-niedozvon',
        'nie-ustroila-stoimost-dostavki',
        'nie-ustroili-sroki-vypolnieniia',
        'nie-otpravliaiem-po-rieghlamientu',
        'failure',
        'otkaz-pri-obrabotkie',
        'otkaz-pri-ghotovnosti',
        'otmienien-nie-ustroila-dostavka',
        'otmienien-nie-ustroila-tsiena',
        'otmienien-nie-vykuplien-v-srok',
        'otmienien-oshibka-oformlieniia',
        'otmienien-tiestovyi-zakaz'
    ];

    /**
     * Constructor
     */
    constructor(
        localStorageRepository: LocalStorageRepositoryInterface,
        kaspiBankApiRepository: KaspiBankApiRepositoryInterface,
        retailCrmApiRepository: RetailCrmApiRepositoryInterface,
    ) {
        this.localStorageRepository = localStorageRepository;
        this.kaspiBankApiRepository = kaspiBankApiRepository;
        this.retailCrmApiRepository = retailCrmApiRepository;
        this.logger = IOC.make(LoggerService) as LoggerService;
    }

    public async handle(partialCancellationUnifier: OrderPartialCancellationUnifier): Promise<void> {
        // Log
        this.logger.info(`[PARTIAL CANCELLATION] Received a request from CRM for a partial cancellation of the order "${partialCancellationUnifier.orderNumber}"`);

        // Get local order
        const localOrder = await this.getLocalOrder(partialCancellationUnifier.orderNumber);

        // Get order from crm
        const orderItemsFromCrm = await this.retailCrmApiRepository.getOrderItemsByOrderCrmId(localOrder.crmId, localOrder.site);

        // Get changed items
        const changedItems = await this.getChangedItems(localOrder, orderItemsFromCrm);

        // If not changed
        if (!changedItems.length) {
            // Log
            await this.localStorageRepository.log(localOrder.id, 'info', `[PARTIAL CANCELLATION] Not found changed items in order "${localOrder.orderNumber}" Finish`);
            return;
        }

        // Update items qty in kaspi
        await this.syncChangedItemsWithKaspi(changedItems, localOrder);
    }

    /**
     * Get local order
     */
    private async getLocalOrder(orderNumber: string): Promise<OrderForChangeStatusType> {
        const order = await this.localStorageRepository.getOrderByNumber(orderNumber);

        // Log
        await this.localStorageRepository.log(order?.id!, 'info', `[PARTIAL CANCELLATION] Received a request from CRM for a partial cancellation of the order`);

        // Get order items (products)
        order!.items = await this.localStorageRepository.getOrderItemsByOrderNumber(orderNumber);

        return order!;
    }

    /**
     * Get  changed
     */
    private async getChangedItems(localOrder: OrderForChangeStatusType, orderItemsFromCrm: CrmOrderItemType[]): Promise<LocalOrderItemType[]> {

        const changedItems = new Array();
        for (const localOrderItem of localOrder.items!) {
            const orderFromCrmItem = this.getOrderFromCrmItemByXmlId(orderItemsFromCrm, localOrderItem.xmlId);

            // If has canceled status
            if (isNull(orderFromCrmItem) || this.ITEMS_CANCELLATION_STATUSES.includes(orderFromCrmItem.status)) {
                localOrderItem.qty = 0;
                changedItems.push(localOrderItem);
                continue;
            }

            // Is not change
            if (localOrderItem.qty === orderFromCrmItem.qty) continue;

            // If change qty
            if (localOrderItem.qty > orderFromCrmItem.qty) {
                localOrderItem.qty = orderFromCrmItem.qty;
                changedItems.push(localOrderItem);
                break;
            }

        }

        // Log
        this.logger.info(`[PARTIAL CANCELLATION] "${localOrder.orderNumber}" Detected changed items:`, changedItems);
        await this.localStorageRepository.log(localOrder.id, 'info', `[PARTIAL CANCELLATION] Detected hanged items: ${JSON.stringify(changedItems)}`);

        return changedItems;
    }

    /**
     * Get item by xmlid
     */
    private getOrderFromCrmItemByXmlId(orderItemsFromCrm: CrmOrderItemType[], xmlId: string) {
        for (const item of orderItemsFromCrm) {
            if (item.xmlId === xmlId) {
                return item;
            }
        }
        return null;
    }

    /**
     * Sync with kaspi
     */
    private async syncChangedItemsWithKaspi(items: LocalOrderItemType[], localOrder: OrderForChangeStatusType) {
        for (const item of items) {
            try {
                // Sync
                await this.kaspiBankApiRepository.updateItemQty(item, localOrder.site);

                // Update in db
                await this.localStorageRepository.updateItemQty(item);

                // Log
                this.logger.info(`[PARTIAL CANCELLATION] "${localOrder.orderNumber}" Item entries "${item.entriesKaspiId}" sync with KASPI is successful, changed item:`, item);
                await this.localStorageRepository.log(localOrder.id, 'error', `[PARTIAL CANCELLATION] Item entries ${item.entriesKaspiId}" sync with KASPI is successful, item: ${JSON.stringify(item)}`);
            } catch (error) {
                // Log
                this.logger.error(`[PARTIAL CANCELLATION] "${localOrder.orderNumber}" An error occurred while sync with kaspi the item "${item.entriesKaspiId}", error:`, error);
                await this.localStorageRepository.log(localOrder.id, 'info', `[PARTIAL CANCELLATION] An error occurred while sync with kaspi the item ${item.entriesKaspiId}", item: ${JSON.stringify(item)}, error: ${JSON.stringify(error)}`);
            }
        }

    }
}
