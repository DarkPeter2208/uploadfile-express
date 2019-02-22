import express, { NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { Server } from 'http';
import { FileController } from './controllers/file.controller';
import fileUpload from 'express-fileupload';

class Server1 {
    app: express.Application;
    server: Server;

    constructor() {
        this.app = express();
        this.config();
        this.routes();
        this.start();
    }

    config(): void {
        this.app.use(fileUpload({
            limits: { fileSize: 10 * 1024 * 1024 } // 10 Mbs
        }));
        this.app.use(cors());
    }

    routes() {
        const router: express.Router = express.Router();
        this.app.use('/', router);
        this.app.use('/api/file', FileController.router);
        // Handle Error
        this.app.use((err: any, req: Request, res: Response, next: NextFunction) => {
            console.error(err);
            res.status(500).send(err);
        });
    }

    start() {
        const port: string | number = process.env.PORT || 3000;
        this.server = this.app.listen(port, () => {
            console.log(`Listening at http://localhost:${port}/`);
        });
    }
}

new Server1();