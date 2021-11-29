import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import AdminAuthUnifier from "../../Unifiers/Adminhtml/AdminAuthUnifier";
import LoggerToDbService from "../LoggerToDbService";
import AdminUserNotFoundException from "../../Exceptions/AdminUserNotFoundException";
import LocalStorageRepositoryInterface from "../../Repositories/LocalStorage/LocalStorageRepositoryInterface";


export default class AdminUserService {

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

    public async getUsers() {
        return await this.localStorageRepository.getUsers()
    }

}