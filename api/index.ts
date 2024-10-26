import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import cors from 'cors';
import { Express } from 'express-serve-static-core';
import bodyParser from 'body-parser';
import userRoutes from './src/routes/users';
import authRoutes from './src/routes/authorizations';
import urlRoutes from './src/routes/urls';
import accessesRoutes from './src/routes/accesses';
import { LoggerLocal } from './src/utils/logger/connection/logger-local';
import { ILogger, Logger } from './src/utils/logger/logger';
import { Database, IDatabase } from './src/repository/connections/database-connection';
dotenv.config();
const {
    SERVER_PORT: serverPort = 3000,
} = process.env;
class Server {
    private app: Express = express();
    private port: number = 3000;
    private logger: ILogger;
    private database: IDatabase;
    constructor() {
        this.logger = new Logger({ logger: new LoggerLocal });
        this.database = new Database({ logger: this.logger });
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use(cors({
            origin: '*',
            optionsSuccessStatus: 200,
        }));
        this.app.use('/users', userRoutes({ logger: this.logger, database: this.database }));
        this.app.use('/auths', authRoutes({ logger: this.logger, database: this.database }));
        this.app.use('/urls', urlRoutes({ logger: this.logger, database: this.database }));
        this.app.use('/', accessesRoutes({ logger: this.logger, database: this.database }));
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
