import LocalStorageRepositoryInterface from "../Repositories/LocalStorage/Adminhtml/LocalStorageRepositoryInterface";

export default class LoggerToDbService {

    protected localStorageRepository: LocalStorageRepositoryInterface;

    /**
     * Constructor
     */
    constructor(localStorageRepository: LocalStorageRepositoryInterface) {
        this.localStorageRepository = localStorageRepository;
    }
}
