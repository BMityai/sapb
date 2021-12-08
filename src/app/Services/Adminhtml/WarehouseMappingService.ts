import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import LocalStorageRepositoryInterface from "../../Repositories/LocalStorage/Adminhtml/LocalStorageRepositoryInterface";
import WarehouseMappingType from "../../Types/WarehouseMappingType";
import SaveWarehousesUnifier from "../../Unifiers/Adminhtml/SaveWarehousesUnifier";

export default class WarehouseMappingService {

    protected localStorageRepository: LocalStorageRepositoryInterface;
    protected loggerService: LoggerService;

    /**
     * Constructor
     */
    public constructor(localStorageRepository: LocalStorageRepositoryInterface, loggerService: LoggerService) {
        this.localStorageRepository = localStorageRepository;
        this.loggerService = loggerService;
    }

    /**
     * Get statuses
     */
    public async getWarehouses(): Promise<WarehouseMappingType[]> {
        return await this.localStorageRepository.getWarehouses();
    }

    /**
     * Save statuses
     */
    public async saveWarehouses(saveStatusesUnifier: SaveWarehousesUnifier): Promise<WarehouseMappingType[]> {
        const saveStatusesPromise = [
            this.removeWarehouses(saveStatusesUnifier),
            this.updateWarehouses(saveStatusesUnifier),
            this.saveNewWarehouses(saveStatusesUnifier),
        ];

        await Promise.all(saveStatusesPromise);

        return await this.localStorageRepository.getWarehouses();
    }

    /**
     * Remove statuses
     */
    private async removeWarehouses(saveStatusesUnifier: SaveWarehousesUnifier): Promise<void> {
        const ids = new Array();
        for (const status of saveStatusesUnifier.data) {
            if (!status.removed) continue;
            ids.push(status.id);
        }

        await this.localStorageRepository.removeWarehousesByIds(ids);
    }


    /**
     * Update warehouses
     */
    private async updateWarehouses(saveStatusesUnifier: SaveWarehousesUnifier): Promise<void> {
        const preparedData = new Array();
        for (const status of saveStatusesUnifier.data) {
            if (status.new || status.removed || !status.edited) continue;

            preparedData.push(status);
        }

        if (!preparedData.length) return;

        await this.localStorageRepository.updateWarehouses(preparedData);
    }

    /**
     * Save new warehouses
     */
    private async saveNewWarehouses(saveStatusesUnifier: SaveWarehousesUnifier): Promise<void> {
        const preparedData = new Array();
        for (const status of saveStatusesUnifier.data) {
            if (!status.new || status.removed) continue;
            preparedData.push({
                crm_warehouse: status.crm,
                kaspi_warehouse: status.kaspi,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }
        if (!preparedData.length) return;

        await this.localStorageRepository.saveNewWarehouses(preparedData);
    }

}
