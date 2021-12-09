import Exception from 'sosise-core/build/Exceptions/Exception';
import ExceptionResponse from 'sosise-core/build/Types/ExceptionResponse';

export default class OrderNotFoundException extends Exception {

    // This variables are optional, you may remove them
    protected httpCode = 404;
    protected code = 3004;

    /**
     * Constructor
     */
    constructor() {
        super('Order not found');
    }

    /**
     * Handle exception
     */
    public handle(exception: this): ExceptionResponse {
        const response: ExceptionResponse = {
            code: this.code, // optional
            httpCode: this.httpCode, // optional
            message: exception.message,
            data: null
        };
        return response;
    }
}
