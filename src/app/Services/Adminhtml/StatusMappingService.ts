
import Helper from "sosise-core/build/Helper/Helper";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import LocalStorageRepositoryInterface from "../../Repositories/LocalStorage/LocalStorageRepositoryInterface";
import StatusMappingType from "../../Types/StatusMappingType";
import LoggerToDbService from "../LoggerToDbService";

export default class StatusMappingService {
    
    protected localStorageRepository: LocalStorageRepositoryInterface;
    protected loggerService: LoggerService;
    protected loggerToDbService: LoggerToDbService;

    /**
     * Constructor
     */
    public constructor(localStorageRepository: LocalStorageRepositoryInterface, loggerService: LoggerService, loggerToDbService: LoggerToDbService) {
        this.localStorageRepository = localStorageRepository;
        this.loggerService = loggerService;
        this.loggerToDbService = loggerToDbService;
    }

    /**
     * Get statuses
     */
    public async getStatuses(): Promise<StatusMappingType[]> {
        return await this.localStorageRepository.getStatuses();
    }

    
}
