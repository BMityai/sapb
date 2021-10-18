import express from 'express';
import { Request, Response, NextFunction } from 'express';
import AdminhtmlController from '../app/Http/Controllers/AdminhtmlController';
import cors from 'cors';
import Helper from 'sosise-core/build/Helper/Helper';
import Auth from '../app/Http/Middlewares/Auth';
import StatusMappingService from '../app/Services/Adminhtml/StatusMappingService';

const router = express.Router();

const corsOptions = {
    origin: '*',
    optionsSuccessStatus: 200
}

const version = 'v1';

router.use(express.json({limit: '10mb'}))
router.use(express.urlencoded({ extended: true, limit: '10mb', parameterLimit: 50000 }))

router.use(cors(corsOptions));


// AdminhtmlController
const adminhtmlController = new AdminhtmlController();

// Auth middleware
const authMiddleware = new Auth();

// Login
router.post(`/frontapi/${version}/auth`, (request: Request, response: Response, next: NextFunction) => {
    adminhtmlController.auth(request, response, next);
});

// Get user by jwt
router.get(`/frontapi/${version}/user`, authMiddleware.handle, (request: Request, response: Response, next: NextFunction) => {
    adminhtmlController.getUserByJwt(request, response, next);
});





// Get statuses
router.get(`/frontapi/${version}/statuses`, authMiddleware.handle, (request: Request, response: Response, next: NextFunction) => {
    adminhtmlController.getStatuses(request, response, next);
});

// Save statuses
router.post(`/frontapi/${version}/statuses`, authMiddleware.handle, (request: Request, response: Response, next: NextFunction) => {
    adminhtmlController.saveStatuses(request, response, next);
});


export default router;
