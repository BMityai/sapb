import { Request, Response, NextFunction } from 'express';
import ContentTypeNotSetException from '../../Exceptions/ContentTypeNotSetException';

export default class CheckContentTypeMiddleware {
    /**
     * This method handles the middleware
     */
    public async handle(request: Request, response: Response, next: NextFunction): Promise<any> {
        if (!['GET'].includes(request.method) && !request.header('content-type')) {
            throw new ContentTypeNotSetException('Content-Type header is not set, please provide the header, so that web server can understand your request');
        }
        next();
    }
}
