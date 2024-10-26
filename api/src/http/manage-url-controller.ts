import { Request, Response } from "express";
import { ILogger } from "../utils/logger/logger";
import { IManageUrlModel } from "../model/manage-url-model";

export interface IManageUrlController {
    index: (req: Request, res: Response) => Promise<Response>;
    save: (req: Request, res: Response) => Promise<Response>;
    delete: (req: Request, res: Response) => Promise<Response>;
}

export class ManageUrlController implements IManageUrlController {
    private manageUrlModel: IManageUrlModel;
    private logger: ILogger; 
    private origin: String;
    constructor({ manageUrlModel, logger }) {
        this.manageUrlModel = manageUrlModel;
        this.logger = logger;
        const {
            SERVER_PORT,
            SERVER_PROTOCOL,
            SERVER_HOST,
            SERVER_HOST_PORT = `${SERVER_HOST}:${SERVER_PORT}`,
        } = process.env;
        this.origin = `${SERVER_PROTOCOL}://${SERVER_HOST_PORT}`;
    }

    public async index(req: Request, res: Response): Promise<Response> {
        try {
            const { params: { short } } = req;
            const endpoint = `${this.origin}/${short}`;
            const urlOrigin = await this.manageUrlModel.findByUrlShort(endpoint);
            if (!urlOrigin) {
                return res.status(404).send();
            }

            res.redirect(String(urlOrigin.urlOrigin));
            return res;
        } catch(error) {
            this.logger.error({ description: 'Ocoreu um erro em nossos serviços', error });
            return res.status(500).send({ error: 'Ocoreu um erro em nossos serviços' });
        }
    }

    public async save(req: Request, res: Response): Promise<Response> {
        try {
            const { body: fields, user: userData } = req;
            Object.assign(fields, { userId: userData?.id || null });
            const user = await this.manageUrlModel.save(fields);
            if (!user) {
                return res.status(400).send({ error: 'Encurtamento da url falhou' });
            }

            return res.status(200).send(user);
        } catch(error) {
            this.logger.error({ description: 'Ocoreu um erro em nossos serviços', error });
            return res.status(500).send({ error: 'Ocoreu um erro em nossos serviços' });
        }
    }

    public async list(req: Request, res: Response): Promise<Response> {
        try {
            const { user: userData } = req;
            if (!userData?.id) {
                return res.status(401).send({ error: 'Não autorizado' });
            }

            const urlShorts = await this.manageUrlModel.findByUserId(userData.id);
            if (!urlShorts) {
                return res.status(400).send({ error: 'Localização de urls encurtadas falhou' });
            }

            return res.status(200).send(urlShorts);
        } catch(error) {
            this.logger.error({ description: 'Ocoreu um erro em nossos serviços', error });
            return res.status(500).send({ error: 'Ocoreu um erro em nossos serviços' });
        }
    }

    public async delete(req: Request, res: Response): Promise<Response> {
        try {
            const { params: { id }, user: userData } = req;
            if (!userData?.id) {
                return res.status(401).send({ error: 'Não autorizado' });
            }

            if (!id) {
                return res.status(400).send({ error: 'O id informado é inválido' });
            }

            const removed = await this.manageUrlModel.remove(id);
            if (!removed) {
                return res.status(400).send({ error: 'Remoção de urls encurtadas falhou' });
            }

            return res.status(200).send({ message: "Url encurtada foi removida com sucesso" });
        } catch(error) {
            this.logger.error({ description: 'Ocoreu um erro em nossos serviços', error });
            return res.status(500).send({ error: 'Ocoreu um erro em nossos serviços' });
        }
    }
}