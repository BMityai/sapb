
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import LocalStorageRepositoryInterface from "../../Repositories/LocalStorage/Adminhtml/LocalStorageRepositoryInterface";
import StatusMappingType from "../../Types/StatusMappingType";
import SaveStatusesUnifier from "../../Unifiers/Adminhtml/SaveStatusesUnifier";

export default class StatusMappingService {

    protected localStorageRepository: LocalStorageRepositoryInterface;
    protected loggerService: LoggerService;

    /**
     * Constructor
     */
    public constructor(localStorageRepository: LocalStorageRepositoryInterface) {
        this.localStorageRepository = localStorageRepository;
    }

    /**
     * Get statuses
     */
    public async getStatuses(): Promise<StatusMappingType[]> {
        return await this.localStorageRepository.getStatuses();
    }

    /**
     * Save statuses
     */
    public async saveStatuses(saveStatusesUnifier: SaveStatusesUnifier): Promise<StatusMappingType[]> {
        const saveStatusesPromise = [
            this.removeStatuses(saveStatusesUnifier),
            this.updateStatuses(saveStatusesUnifier),
            this.saveNewStatuses(saveStatusesUnifier),
        ];

        await Promise.all(saveStatusesPromise);

        return await this.localStorageRepository.getStatuses();
    }

    /**
     * Remove statuses
     */
    private async removeStatuses(saveStatusesUnifier: SaveStatusesUnifier): Promise<void> {
        const ids = new Array();
        for (const status of saveStatusesUnifier.data) {
            if (!status.removed) continue;
            ids.push(status.id);
        }

        await this.localStorageRepository.removeStatusesByIds(ids);
    }


    /**
     * Update statuses
     */
    private async updateStatuses(saveStatusesUnifier: SaveStatusesUnifier): Promise<void> {
        const preparedData = new Array();
        for (const status of saveStatusesUnifier.data) {
            if (status.new || status.removed || !status.edited) continue;

            preparedData.push(status);
        }

        if(!preparedData.length) return;

        await this.localStorageRepository.updateStatuses(preparedData);
    }

    /**
     * Save new statuses
     */
    private async saveNewStatuses(saveStatusesUnifier: SaveStatusesUnifier): Promise<void> {
        const preparedData = new Array();
        for (const status of saveStatusesUnifier.data) {
            if (!status.new || status.removed) continue;
            preparedData.push({
                crm_status: status.crm,
                kaspi_status: status.kaspi,
                created_at: new Date(),
                updated_at: new Date(),
            });
        }
        if(!preparedData.length) return;

        await this.localStorageRepository.saveNewStatuses(preparedData);
    }

}
