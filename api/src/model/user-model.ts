import { IUserRepository } from "../repository/user-repository";
import { ILogger } from "../utils/logger/logger";
import { IPasswordHash } from "../utils/password/password-hash";
import { ITokenManage } from "../utils/token/token-manage";

export type UserType = {
    id?: number;
    name?: String;
    email?: String;
    password?: String;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date|null;
} | null;

export type TokenType = {
    token: String;
    user: UserType;
} | null;

export interface IUserModel {
    save: (data: UserType) => Promise<UserType>;
    login: (email: String, password: String) => Promise<TokenType>;
};



export class UserModel implements IUserModel{
    private userRepository: IUserRepository;
    private exclude = ['password', 'deleted_at'];
    private logger: ILogger;
    private passwordHash: IPasswordHash;
    private tokenManage: ITokenManage;
    private validate = {
        'name': (value: any) => typeof value === 'string' && /\w/g.test(String(value)),
        'email': (value: any) => typeof value === 'string' && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(String(value)),
        'password': (value: any) => typeof value === 'string' && value.length > 8 && value.length < 100,
    };
    private modify = {
        'password': (value: any) => this.passwordHash.generateHash(String(value)),
    };

    constructor({ userRepository, logger, passwordHash, tokenManage }) {
        this.userRepository = userRepository;
        this.logger = logger;
        this.passwordHash = passwordHash;
        this.tokenManage = tokenManage;
    }

    private async fildsValidator(fields: any): Promise<Boolean> {
        const fildsMapping = Object.entries(fields).filter(
            ([field, value]) => this.validate[field] && this.validate[field](value)
        );
        return !!(Object.keys(this.validate).length === fildsMapping.length);
    }

    private async fildsModify(fields: any): Promise<void> {
        Object.entries(this.modify).map(([field, modify]) => fields[field] && (fields[field] = modify(fields[field])));
    }

    private async filter(data: UserType) {
        await Promise.all(this.exclude.map(async field => data && delete data[field]));
    }

    public async save(data: any): Promise<UserType> {
        try {
            const isValide = await this.fildsValidator(data);
            if (isValide) {
                await this.fildsModify(data);
                const user = await this.userRepository.save(data);
                await this.filter(user);
                return user;
            }
            this.logger.warn({ description: 'Os campos informado não são válidos' });
            return null;
        } catch(error) {
            this.logger.error({ description: 'Erro ao tentar acionar o metodo save', error });
            return null;
        }
    }

    public async login(email: String, password: String): Promise<TokenType> {
        try {
            if (email) {
                const user = await this.userRepository.findByEmail(email);
                const isValid = this.passwordHash.compare(password, String(user?.password));
                if (isValid) {
                    const token = await this.tokenManage.generateToken(user);
                    return token && {
                        token,
                        user: {
                            id: user?.id,
                            name: user?.name,
                            email: user?.email,
                        }
                    };
                }
                return null;
            }
            this.logger.warn({ description: `Usuário ${email} não foi identificado` });
            return null;
        } catch(error) {
            this.logger.error({ description: 'Erro na identificação do usuário', error });
            return null;
        }
    }
}