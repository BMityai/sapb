import Exception from 'sosise-core/build/Exceptions/Exception';
import ExceptionResponse from 'sosise-core/build/Types/ExceptionResponse';

export default class UnauthorizedException extends Exception {

    // This variables are optional, you may remove them
    public login: string;
    protected httpCode = 401;
    protected code = 3004;

    /**
     * Constructor
     */
    constructor(message: string) {
        super(message);
    }

    /**
     * Handle exception
     */
    public handle(exception: this): ExceptionResponse {
        const response: ExceptionResponse = {
            code: this.code, // optional
            httpCode: this.httpCode, // optional
            message: exception.message,
            data: {
                login: this.login
            }
        };
        return response;
    }
}
