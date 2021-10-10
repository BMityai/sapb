import express from 'express';
import { Request, Response, NextFunction } from 'express';
import AdminhtmlController from '../app/Http/Controllers/AdminhtmlController';
import cors from 'cors';
import Helper from 'sosise-core/build/Helper/Helper';

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

// Login
router.post(`/frontapi/${version}/auth`, (request: Request, response: Response, next: NextFunction) => {
    adminhtmlController.auth(request, response, next);
});

// Login
router.get(`/frontapi/${version}/user`, (request: Request, response: Response, next: NextFunction) => {
    adminhtmlController.getUserByJwt(request, response, next);
});


export default router;
