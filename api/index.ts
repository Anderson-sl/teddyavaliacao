import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import { Express } from 'express-serve-static-core';
import bodyParser from 'body-parser';
import userRoutes from './src/routes/users';
import { LoggerLocal } from './src/utils/logger/connection/logger-local';
import { ILogger, Logger } from './src/utils/logger/logger';
dotenv.config();
const {
    SERVER_PORT: serverPort = 3000,
} = process.env;
class Server {
    private app: Express = express();
    private port: number = 3000;
    private logger: ILogger;
    constructor() {
        this.logger = new Logger({ logger: new LoggerLocal })
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use('/user', userRoutes({ logger: this.logger }));
        this.port = Number(serverPort);
    }

    start(){
        http.createServer(this.app)
            .listen(this.port, () => {
                this.logger.info({ description: `API Running in port ${this.port}` });
            });
    }
}

const server = new Server();
server.start();
