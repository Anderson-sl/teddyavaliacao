import { Request, Response, Router } from "express";
import { IUserModel } from "../model/user-model";
import { ILogger } from "../utils/logger/logger";

export interface IAuthController {
    login: (req: Request, res: Response) => Promise<Response>;
}

export class AuthController implements IAuthController {
    private userModel: IUserModel;
    private logger: ILogger; 
    constructor({ userModel, logger }) {
        this.userModel = userModel;
        this.logger = logger;
    }

    async login(req: Request, res: Response): Promise<Response> {
        try{
            const {
                body: {
                    email,
                    password,
                },
            } = req;
            const token = await this.userModel.login(email, password);
            if (token) return res.status(200).send(token);
        
            return res.status(400).send({ error: 'Usuário não identificado' });
        } catch(error) {
            this.logger.error({ description: 'Ocoreu um erro em nossos serviços', error });
            return res.status(500).send({ error: 'Ocoreu um erro em nossos serviços' });
        }
    };
}