import { Request, Response, Router } from "express";
import { IUserModel } from "../model/user-model";
import { ILogger } from "../utils/logger/logger";

export interface IUserController {
    save: (req: Request, res: Response) => Promise<Response>;
}

export class UserController implements IUserController {
    private userModel: IUserModel;
    private logger: ILogger; 
    constructor({ userModel, logger }) {
        this.userModel = userModel;
        this.logger = logger;
    }

    public async save(req: Request, res: Response): Promise<Response> {
        try {
            const { body: fields } = req;
            const user = await this.userModel.save(fields);
            if (!user) {
                return res.status(400).send({ error: 'A criação do usuário falhou' });
            }

            return res.status(200).send(user);
        } catch(error) {
            this.logger.error({ description: 'Ocoreu um erro em nossos serviços', error });
            return res.status(500).send({ error: 'Ocoreu um erro em nossos serviços' });
        }
    }
}