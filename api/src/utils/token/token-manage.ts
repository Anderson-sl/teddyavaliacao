import jsonwebtoekn from 'jsonwebtoken';
import { UserType } from '../../model/user-model';
import { ILogger } from '../logger/logger';

export interface ITokenManage {
    generateToken: (user: UserType) => Promise<String|null>;
    verifyToken: (token: String) => Promise<UserType|null>;
}

export class TokenManage implements ITokenManage{
    private jwt: any;
    private salt: String;
    private exp: String; 
    private logger: ILogger;
    constructor({ logger }) {
        this.jwt = jsonwebtoekn;
        this.salt = String(process.env.TOKEN_SALT);
        this.exp = String(process.env.TOKEN_EXPIRE_IN);
        this.logger = logger;
    }

    public async generateToken(user: UserType): Promise<String|null>   {
        try {
            return this.jwt.sign({
                id: user?.id,
                name: user?.name,
            }, this.salt, { expiresIn: this.exp });
        } catch(error) {
            this.logger.error({
                description: 'Falha na geração de token',
                user: {
                    id: user?.id || null,
                    name: user?.name || null,
                    email: user?.email || null,
                },
                error
            });
            return null;
        }
    }

    public async verifyToken(token: String): Promise<UserType|null>   {
        try {
            const data = this.jwt.verify(token, this.salt);
            return {
                id: data.id,
                name: data.name,
            };
        } catch(error) {
            this.logger.error({ description: 'Token expirado', error });
            return null;
        } 
    }
}