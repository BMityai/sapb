import StatusMappingType from "../../Types/StatusMappingType";

export default interface LocalStorageRepositoryInterface {

    /**
     * Get statuses
     * 
     * @returns 
     */
    getStatuses(): Promise<StatusMappingType[]>;

    
}
