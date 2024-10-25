import { IUser } from "../model/user-model";
import { IDatabase } from "./connections/database-connection";

export interface IUserRepository {
    save: (data: IUser) => IUser;
}

export class UserRepository {
    private databaseConnection: IDatabase;
    constructor({ databaseConnection }){
        this.databaseConnection = databaseConnection;
    }

    public async save(data: IUser): Promise<IUser> {
        if (!data) return null;
        const pool = await this.databaseConnection.getPool();
        const { rows: [user=null] } = await pool.query(`
            insert into users (name, email, password, created_at, updated_at)
            values ($1, $2, $3, now(), now()) returning *;    
        `, [
            data.name,
            data.email,
            data.password,
        ]);

        return user;
    }
}