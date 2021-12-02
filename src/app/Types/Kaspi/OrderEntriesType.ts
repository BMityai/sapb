import Helper from "sosise-core/build/Helper/Helper";

export default class OrderEntriesType {
    public deliveryPointOfService: {
        getPointOfServiceUrl: string
        kaspiId: string;
        displayName: string;
        streetName: string | null;
        streetNumber: string | null;
        town: string | null;
        district: string | null;
        building: string | null;
        formattedAddress: string | null;
    } = {
            getPointOfServiceUrl: '',
            kaspiId: '',
            displayName: '',
            streetName: null,
            streetNumber: null,
            town: null,
            district: null,
            building: null,
            formattedAddress: null
        };

    public products: {
        quantity: number,
        basePrice: number,
        getProductUrl: string,
        masterProduct: {
            kaspiId: string;
            code: string;
            name: string;
            manufacturer: string | null;
        },
        merchantProduct: {
            kaspiId: string;
            code: string;
            name: string;
            manufacturer: string | null;
        },
    }[] = [];
    private orderEntriesData: any;

    // Constructor
    constructor(orderEntriesData: any) {
        this.orderEntriesData = orderEntriesData;

        // Prepare properties
        this.setProperties();

        this.removeServiceProps();


    }

    /**
     * Set properties
     */
    private setProperties(): void {
        this.setGetProductsUrl();
        this.setGetDeliveryPointOfServiceUrl();
    }

    /**
     * Set delivery poit of service
     */
    private setGetDeliveryPointOfServiceUrl(): void {
        this.deliveryPointOfService.getPointOfServiceUrl = this.orderEntriesData[0].relationships.deliveryPointOfService.links.related;
    }

    /**
     * Ser products
     */
    private setGetProductsUrl(): void {
        for (const entry of this.orderEntriesData) {
            this.products.push({
                quantity: entry.attributes.quantity,
                basePrice: entry.attributes.basePrice,
                getProductUrl: entry.relationships.product.links.related,
                masterProduct: {
                    kaspiId: '',
                    code: '',
                    name: '',
                    manufacturer: null
                },
                merchantProduct: {
                    kaspiId: '',
                    code: '',
                    name: '',
                    manufacturer: null
                }
            });
        }
    }

    /**
     * Remove service properties
     */
    public removeServiceProps(): void {
        const props = ['orderEntriesData'];
        for (const prop of props) {
            delete this[prop];
        }
    }
}
