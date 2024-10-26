import { IUserRepository } from "../repository/user-repository";
import { ILogger } from "../utils/logger/logger";
import { PasswordHash } from "../utils/password/password-hash";

export type IUser = {
    id?: number;
    name?: String;
    email?: String;
    password?: String;
    created_at?: Date;
    updated_at?: Date;
    deleted_at?: Date|null;
} | null;

export interface IUserModel {
    save: (data: IUser) => IUser;
};



export class UserModel {
    private userRepository: IUserRepository;
    private exclude = ['password'];
    private logger: ILogger;
    private passwordHash: any;
    private validate = {
        'name': (value: any) => typeof value === 'string' && /\w/g.test(String(value)),
        'email': (value: any) => typeof value === 'string' && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(String(value)),
        'password': (value: any) => typeof value === 'string' && value.length > 8 && value.length < 100,
    };
    private modify = {
        'password': (value: any) => this.passwordHash.generateHash(String(value)),
    };

    constructor({ userRepository, logger, passwordHash }) {
        this.userRepository = userRepository;
        this.logger = logger;
        this.passwordHash = passwordHash;
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

    private async filter(data: IUser) {
        await Promise.all(this.exclude.map(async field => data && delete data[field]));
    }

    public async save(data: any): Promise<IUser> {
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
}