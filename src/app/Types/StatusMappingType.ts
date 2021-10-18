export default class StatusMappingType {
    id: string;
    crm: string;
    kaspi: string;
    new = false;
    edited = false;
    removed = false;


    /**
     * Constructor
     * 
     * @param data 
     */
    constructor(data: any) {
        this.setProps(data);
    }

    /**
     * Set props
     * 
     * @param data 
     */
    private setProps(data: any): void {
        this.id = data.id;
        this.crm = data.crm_status;
        this.kaspi = data.kaspi_status;
    }
}
