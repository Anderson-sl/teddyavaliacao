import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import { Express } from 'express-serve-static-core';
import bodyParser from 'body-parser';
import userRoutes from './src/routes/users';
dotenv.config();
const {
    SERVER_PORT: serverPort = 3000,
} = process.env;

class Server {
    private app: Express = express();
    private port: number = 3000;
    constructor() {
        this.app.use(bodyParser.urlencoded({ extended: false }));
        this.app.use(bodyParser.json());
        this.app.use('/user', userRoutes);
        this.port = Number(serverPort);
    }

    start(){
        http.createServer(this.app)
            .listen(this.port, () => {
                console.log(`API Running in port ${this.port}`);
            });
    }
}

const server = new Server();
server.start();
