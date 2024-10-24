import dotenv from 'dotenv';
import http from 'http';
import express from 'express';
import bodyParser from 'body-parser';

dotenv.config();
const app = express();
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

const {
    SERVER_PORT: serverPort = 3000,
} = process.env;

const server = http.createServer(app);

server.listen(serverPort, () => {
    console.log(`API Running in port ${serverPort}`);
});