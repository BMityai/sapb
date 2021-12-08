import express from 'express';
import { Request, Response, NextFunction } from 'express';
import AdminhtmlController from '../app/Http/Controllers/AdminhtmlController';
import DocumentationBasicAuthMiddleware from '../app/Http/Middlewares/DocumentationBasicAuthMiddleware';
import adminhtm from './adminhtml';
import cors from 'cors';
import ApiAuthMiddleware from '../app/Http/Middlewares/ApiAuthMiddleware';
import CrmController from '../app/Http/Controllers/CrmController';

const router = express.Router();


router.use(adminhtm);

const version = 'v1';


// Documentation
const documentaionBasicAuthMiddleware = new DocumentationBasicAuthMiddleware();
router.use('/docs', [
    documentaionBasicAuthMiddleware.handle,
    express.static(process.cwd() + '/docs', { index: 'index.html' })
]);

// c
const apiAuthMiddleware = new ApiAuthMiddleware();
const crmController = new CrmController();
router.post(`/api/${version}/status/update`, apiAuthMiddleware.handle, (request: Request, response: Response, next: NextFunction) => {
    crmController.changeStatus(request, response, next);
});

export default router;
