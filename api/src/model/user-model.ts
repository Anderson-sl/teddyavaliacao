import { IUserRepository } from "../repository/user-repository";
import bcrypt from 'bcrypt';

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
    private cript: any;
    private userRepository: IUserRepository;
    private exclude = ['password'];
    private validate = {
        'name': (value: any) => typeof value === 'string' && /\w/g.test(String(value)),
        'email': (value: any) => typeof value === 'string' && /^[\w-\.]+@([\w-]+\.)+[\w-]{2,4}$/g.test(String(value)),
        'password': (value: any) => typeof value === 'string' && value.length > 8 && value.length < 100,
    };
    private modify = {
        'password': (value: any) => {
            const salt = this.cript.genSaltSync(12);
            return this.cript.hashSync(String(value), salt);
        },
    };
    constructor({ userRepository }) {
        this.userRepository = userRepository;
        this.cript = bcrypt;
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
        const isValide = await this.fildsValidator(data);
        if (isValide) {
            await this.fildsModify(data);
            const user = await this.userRepository.save(data);
            await this.filter(user);
            return user;
        }
        return null;
    }
}