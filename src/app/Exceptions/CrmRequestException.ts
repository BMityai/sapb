import Exception from 'sosise-core/build/Exceptions/Exception';
import ExceptionResponse from 'sosise-core/build/Types/ExceptionResponse';

export default class CrmRequestException extends Exception {

    // This variables are optional, you may remove them
    public params: any;
    public response: any;
    public httpCode: 400;

    /**
     * Constructor
     */
    constructor(message: string, params: any, response: any) {
        super(message);

        this.params = params;
        this.response = response;
    }

    /**
     * Handle exception
     */
    public handle(exception: this, response: any) {
        const httpResponse: ExceptionResponse = {
            message: 'Exception occured during request to CRM',
            httpCode: this.httpCode,
            data: {
                details: exception.message,
                params: this.params,
                response: this.response
            }
        };
        return httpResponse;
    }
}
