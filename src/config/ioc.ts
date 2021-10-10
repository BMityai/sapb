import IOC from "sosise-core/build/ServiceProviders/IOC";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import AuthRepository from "../app/Repositories/LocalStorage/Adminhtml/Auth/AuthRepository";
import LoggerRepository from "../app/Repositories/LocalStorage/Logger/LoggerRepository";
import AuthService from "../app/Services/Adminhtml/AuthService";
import LoggerToDbService from "../app/Services/LoggerToDbService";

/**
 * IOC Config, please register here your services
 */
const iocConfig = {
    /**
     * Singleton services
     *
     * How to register:
     * YourServiceName: () => new YourServiceName()
     *
     * How to use:
     * const logger = IOC.makeSingleton(LoggerService) as LoggerService;
     */
    singletons: {
    },

    /**
     * Non singleton services
     *
     * How to register:
     * YourServiceName: () => new YourServiceName()
     *
     * How to use:
     * const logger = IOC.make(LoggerService) as LoggerService;
     */
    nonSingletons: {
        /**
         * This service is included in the core out of the box
         * If you want to override LoggerService just uncomment this code and import all necessary modules
         */
        // LoggerService: () => {
        //     if (process.env.APP_ENV === 'local') {
        //         return new LoggerService(new LoggerPrettyConsoleRepository());
        //     }
        //     return new LoggerService(new LoggerJsonConsoleRepository());
        // }

        // Logger to db service
        LoggerToDbService: () => {
            new LoggerToDbService(new LoggerRepository)
        },

        // Auth service
        AuthService: () => {
            return new AuthService(new AuthRepository, IOC.make(LoggerService), IOC.make(LoggerToDbService));
        },

    }
};

export default iocConfig;
