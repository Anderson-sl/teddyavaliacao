import { Request, Response, Router } from "express";
import { IUserModel } from "../model/user-model";

export interface IUserController {
    save: (req: Request, res: Response) => Response;
}

export class UserController {
    private userModel: IUserModel; 
    constructor({ userModel }) {
        this.userModel = userModel;
    }

    public async save(req: Request, res: Response): Promise<any> {
        try {
            const { body: fields } = req;
            const user = await this.userModel.save(fields);
            if (!user) {
                return res.status(400).send({ error: 'A criação do usuário falhou' });
            }

            return res.status(200).send(user);
        } catch(error) {
            return res.status(500).send({ error: 'Ocooreu um erro em nossos serviços' });
        }
    }
}