import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import authConfig from '../../../config/auth';
import UnauthorizedException from '../../Exceptions/UnauthorizedException';

export default class Auth {
    /**
     * This method handles the middleware
     */
    public async handle(request: Request, response: Response, next: NextFunction): Promise<any> {
        const token = request.headers.token;

        if(!token) {
            throw new UnauthorizedException('Unauthorized');
        }

        try {
            jwt.verify(request.headers.token as string, authConfig.secret);
            next()
        } catch(e) {
            throw new UnauthorizedException('Unauthorized');
        }
    }
}
