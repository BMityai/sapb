import IOC from "sosise-core/build/ServiceProviders/IOC";
import LoggerService from "sosise-core/build/Services/Logger/LoggerService";
import KaspiBankApiRepository from "../app/Repositories/KaspiBank/KaspiBankApiRepository";
import AuthRepository from "../app/Repositories/LocalStorage/Adminhtml/Auth/AuthRepository";
import LocalStorageRepositoryAdminHtml from "../app/Repositories/LocalStorage/Adminhtml/LocalStorageRepository";
import LocalStorageRepository from "../app/Repositories/LocalStorage/LocalStorageRepository";
import LsApiRepository from "../app/Repositories/LoyaltySystem/LsApiRepository";
import RetailCrmApiRepository from "../app/Repositories/RetailCrm/RetailCrmApiRepository";
import AdminUserService from "../app/Services/Adminhtml/AdminUserService";
import AuthService from "../app/Services/Adminhtml/AuthService";
import DashboardService from "../app/Services/Adminhtml/DashboardService";
import StatusMappingService from "../app/Services/Adminhtml/StatusMappingService";
import WarehouseMappingService from "../app/Services/Adminhtml/WarehouseMappingService";
import ExportOrdersService from "../app/Services/ExportOrdersService";
import GetChangesFromKaspiService from "../app/Services/GetChangesFromKaspiService";
import GetNewOrdersFromKaspiService from "../app/Services/GetNewOrdersFromKaspiService";

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


        // Auth service
        AuthService: () => {
            return new AuthService(new AuthRepository(), IOC.make(LoggerService));
        },

        // Status mapping service
        StatusMappingService: () => {
            return new StatusMappingService(new LocalStorageRepositoryAdminHtml());
        },

        // Warehouse mapping service
        WarehouseMappingService: () => {
            return new WarehouseMappingService(new LocalStorageRepositoryAdminHtml(), IOC.make(LoggerService));
        },

        // Dashboard service
        DashboardService: () => {
            return new DashboardService(new LocalStorageRepositoryAdminHtml(), IOC.make(LoggerService));
        },

        // AdminUser service
        AdminUserService: () => {
            return new AdminUserService(new LocalStorageRepositoryAdminHtml(), IOC.make(LoggerService));
        },

        // GetNewOrdersFromKaspiService service
        GetNewOrdersFromKaspiService: () => {
            return new GetNewOrdersFromKaspiService(
                new KaspiBankApiRepository(),
                new LocalStorageRepository(),
                new RetailCrmApiRepository(),
                new LsApiRepository()
            );
        },

        // ExportOrdersService service
        ExportOrdersService: () => {
            return new ExportOrdersService(
                new LocalStorageRepository(),
                new RetailCrmApiRepository()
            );
        },

        // GetChangesFromKaspiService service
        GetChangesFromKaspiService: () => {
            return new GetChangesFromKaspiService(
                new LocalStorageRepository(),
                new KaspiBankApiRepository(),
                new RetailCrmApiRepository()
            );
        },

    }
};

export default iocConfig;
