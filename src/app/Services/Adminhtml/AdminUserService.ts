import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import AdminAuthUnifier from "../../Unifiers/Adminhtml/AdminAuthUnifier";
import LoggerToDbService from "../LoggerToDbService";
import AdminUserNotFoundException from "../../Exceptions/AdminUserNotFoundException";
import LocalStorageRepositoryInterface from "../../Repositories/LocalStorage/Adminhtml/LocalStorageRepositoryInterface";
import Helper from "sosise-core/build/Helper/Helper";
import CreateUserUnifier from "../../Unifiers/Adminhtml/CreateUserUnifier";
import AdminUserType from "../../Types/AdminUserType";


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
        return await this.localStorageRepository.getUsers();
    }

    public async createUser(createUserunifier: CreateUserUnifier) {
        await this.localStorageRepository.createUser(createUserunifier);
    }

    /**
     * Update user
     */
    public async updateUser(createUserunifier: CreateUserUnifier):Promise<AdminUserType> {
        return await this.localStorageRepository.updateUser(createUserunifier);
    }

}