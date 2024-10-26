import { ILogger } from "../logger/logger";
import bcrypt from 'bcrypt';

export class PasswordHash {
    private logger: ILogger;
    private crypt: any;
    constructor({ logger }) {
        this.logger = logger;
        this.crypt = bcrypt;
    }

    generateHash(pass: String) {
        const salt = this.crypt.genSaltSync(12);
        return this.crypt.hashSync(pass, salt);
    }
}