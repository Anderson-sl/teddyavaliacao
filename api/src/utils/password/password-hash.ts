import { ILogger } from "../logger/logger";
import bcrypt from 'bcrypt';

export interface IPasswordHash {
    generateHash: (pass: String) => String;
    compare: (input: String, source: String) => Boolean;
}

export class PasswordHash implements IPasswordHash{
    private logger: ILogger;
    private crypt: any;
    constructor({ logger }) {
        this.logger = logger;
        this.crypt = bcrypt;
    }

    generateHash(pass: String): String {
        const salt = this.crypt.genSaltSync(12);
        return this.crypt.hashSync(pass, salt);
    }

    compare(input: String, source: String): Boolean {
        const t = this.crypt.compareSync(input, source);
         return t;
    }
}