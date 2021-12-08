import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import LocalStorageRepositoryInterface from "../../Repositories/LocalStorage/Adminhtml/LocalStorageRepositoryInterface";
import CreateUserUnifier from "../../Unifiers/Adminhtml/CreateUserUnifier";
import AdminUserType from "../../Types/AdminUserType";


export default class AdminUserService {

    protected localStorageRepository: LocalStorageRepositoryInterface;
    protected loggerService: LoggerService;

    /**
     * Constructor
     */
    public constructor(localStorageRepository: LocalStorageRepositoryInterface, loggerService: LoggerService) {
        this.localStorageRepository = localStorageRepository;
        this.loggerService = loggerService;
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
