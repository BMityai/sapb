import Exception from 'sosise-core/build/Exceptions/Exception';
import LoggerService from 'sosise-core/build/Services/Logger/LoggerService';
import ExceptionResponse from 'sosise-core/build/Types/ExceptionResponse';

export default class KaspiRequestException extends Exception {

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
            message: 'Exception occured during request to Kaspi',
            httpCode: this.httpCode,
            data: {
                details: exception.message,
                params: exception.params,
                response: exception.response
            }
        };
        return httpResponse;
    }
}
