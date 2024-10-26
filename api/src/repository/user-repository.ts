import { IUser } from "../model/user-model";
import { ILogger } from "../utils/logger/logger";
import { IDatabase } from "./connections/database-connection";

export interface IUserRepository {
    save: (data: IUser) => IUser;
}

export class UserRepository {
    private databaseConnection: IDatabase;
    private logger: ILogger;
    constructor({ databaseConnection, logger }){
        this.databaseConnection = databaseConnection;
        this.logger = logger;
    }

    public async save(data: IUser): Promise<IUser> {
        try {
            if (!data) {
                this.logger.warn({ description: 'Nenhum dado do usuário foi informado' });
                return null;
            }
            const pool = await this.databaseConnection.getPool();
            const { rows: [user=null] } = await pool.query(`
                insert into users (name, email, password, created_at, updated_at)
                values ($1, $2, $3, now(), now()) returning *;    
            `, [
                data.name,
                data.email,
                data.password,
            ]);
            user && this.logger.info({
                description: 'Usuário salvo com sucesso',
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                } 
            });
            return user;
        } catch(error) {
            this.logger.error({ description: 'Erro ao tentar salvar o usuário', error });
            return null;
        }
    }
}