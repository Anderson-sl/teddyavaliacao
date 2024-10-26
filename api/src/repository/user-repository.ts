import { UserType } from "../model/user-model";
import { ILogger } from "../utils/logger/logger";
import { IDatabase } from "./connections/database-connection";

export interface IUserRepository {
    save: (data: UserType) => Promise<UserType>;
    findByEmail: (email: String) => Promise<UserType>;
}

export class UserRepository implements IUserRepository{
    private databaseConnection: IDatabase;
    private logger: ILogger;
    constructor({ databaseConnection, logger }){
        this.databaseConnection = databaseConnection;
        this.logger = logger;
    }

    public async save(data: UserType): Promise<UserType> {
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
            !user && this.logger.info({
                description: 'Usuário não foi salvo',
                user: {
                    id: null,
                    name: data.name || '',
                    email: data.email || '',
                } 
            });
            return user;
        } catch(error) {
            this.logger.error({ description: 'Erro ao tentar salvar o usuário', error });
            return null;
        }
    }

    public async findByEmail(email: String): Promise<UserType> {
        try {
            if (!email) {
                this.logger.warn({ description: 'Nenhum email foi informado' });
                return null;
            }
            const pool = await this.databaseConnection.getPool();
            const { rows: [user=null] } = await pool.query(
                `
                    select
                        *
                    from
                        users u
                    where
                        u.email = $1 and
                        u.deleted_at is null;    
                `, [email]
            );
            !user && this.logger.info({
                description: `Usuário vinculado ao email ${email} não foi localizado`,
                user: {
                    id: user.id,
                    name: user.name,
                    email: user.email,
                } 
            });
            return user;
        } catch(error) {
            this.logger.error({ description: `Erro ao tentar localizar o usuário vinculado ao email ${email}`, error });
            return null;
        }
    }
}