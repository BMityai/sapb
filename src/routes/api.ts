import express from 'express';
import { Request, Response, NextFunction } from 'express';
import AdminhtmlController from '../app/Http/Controllers/AdminhtmlController';
import DocumentationBasicAuthMiddleware from '../app/Http/Middlewares/DocumentationBasicAuthMiddleware';
import adminhtm from './adminhtml';
import ApiAuthMiddleware from '../app/Http/Middlewares/ApiAuthMiddleware';
import CrmController from '../app/Http/Controllers/CrmController';
import CheckContentTypeMiddleware from '../app/Http/Middlewares/CheckContentTypeMiddleware';

const router = express.Router();

router.use(adminhtm);

const version = 'v1';


// Documentation
const documentaionBasicAuthMiddleware = new DocumentationBasicAuthMiddleware();
router.use('/docs', [
    documentaionBasicAuthMiddleware.handle,
    express.static(process.cwd() + '/docs', { index: 'index.html' })
]);

// Api auth middleware
const apiAuthMiddleware = new ApiAuthMiddleware();

// Content-Type middleware
const contentTypeMiddleware = new CheckContentTypeMiddleware();

// Crm controller
const crmController = new CrmController();

// Order status update
router.post(`/api/${version}/order/status`, contentTypeMiddleware.handle, apiAuthMiddleware.handle, (request: Request, response: Response, next: NextFunction) => {
    crmController.changeStatus(request, response, next);
});

// Order status update
router.post(`/api/${version}/order/items`, contentTypeMiddleware.handle, apiAuthMiddleware.handle, (request: Request, response: Response, next: NextFunction) => {
    crmController.cancelPartOfTheOrder(request, response, next);
});

// Get order
router.post(`/api/${version}/order/manual_sync`, contentTypeMiddleware.handle, apiAuthMiddleware.handle, (request: Request, response: Response, next: NextFunction) => {
    crmController.syncOrderByNumber(request, response, next);
});

export default router;
