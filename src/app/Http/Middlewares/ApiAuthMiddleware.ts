import { Request, Response, NextFunction } from 'express';

export default class ApiAuthMiddleware {
    /**
     * This method handles the middleware
     */
    public async handle(request: Request, response: Response, next: NextFunction): Promise<any> {
        // Before
        next();
        // After
    }
}
