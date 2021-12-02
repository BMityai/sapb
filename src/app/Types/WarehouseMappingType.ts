export default class WarehouseMappingType {
    id: string;
    crm: string;
    kaspi: string;
    new = false;
    edited = false;
    removed = false;


    /**
     * Constructor
     */
    constructor(data: any) {
        this.setProps(data);
    }

    /**
     * Set props
     */
    private setProps(data: any): void {
        this.id = data.id;
        this.crm = data.crm_warehouse;
        this.kaspi = data.kaspi_warehouse;
    }
}
