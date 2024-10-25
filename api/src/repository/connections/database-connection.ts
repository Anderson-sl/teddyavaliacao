import { Pool } from 'pg';

export interface IDatabase {
    getPool: () => any;
}

export class Database {
    private pool: any;
    constructor() {}

    #initPool() {
        try {
            return new Pool({
                host: `${process.env.SERVER_DB_HOST}`,
                user: `${process.env.SERVER_DB_USER}`,
                password: `${process.env.SERVER_DB_PASSWORD}`,
                port: `${process.env.SERVER_DB_PORT}`,
                database: `${process.env.SERVER_DB_DATABASE}`,
                max: `${process.env.SERVER_DB_LIMIT}`
            });
        } catch(error) {
            console.log(error)
            process.exit(1);
        }
    }

    async getPool() {
        !this.pool && (this.pool = this.#initPool());
        return await this.pool.connect();
    }
}