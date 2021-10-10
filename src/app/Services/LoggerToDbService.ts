import LocalStorageRepositoryInterface from "../Repositories/LocalStorage/LocalStorageRepositoryInterface";

export default class LoggerToDbService {

    protected localStorageRepository: LocalStorageRepositoryInterface;

    /**
     * Constructor
     */
    constructor(localStorageRepository: LocalStorageRepositoryInterface) {
        this.localStorageRepository = localStorageRepository;
    }
}
