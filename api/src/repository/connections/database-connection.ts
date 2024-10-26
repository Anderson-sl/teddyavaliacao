import { Pool } from 'pg';
import { ILogger } from '../../utils/logger/logger';

export interface IDatabase {
    getPool: () => any;
}

export class Database {
    private pool: any;
    private logger: ILogger;
    private conn: any;
    constructor({ logger }) {
        this.logger = logger;
        if (!this.pool) {
            this.pool = this.#initPool();
            this.logger.info({ description: 'Conexão com banco de dados estabelecida com sucesso' });
        }
    }

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
            this.logger.error({ description: 'Falha na inicialização do Pool de conexões do banco de dados', error });
        }
    }

    async getPool() {
        try {
            if (!this.conn) {
                this.conn = await this.pool.connect();
            }
            return this.conn;
        } catch(error) {
            this.logger.error({ description: 'Falha na geração da conexão com o banco de dados', error });
        }
    }
}