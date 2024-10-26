import { NextFunction, Request, Response } from "express";
import { ITokenManage } from "../../utils/token/token-manage";

export class ManageTokenMiddleware {
    private tokenManage: ITokenManage;
    constructor({ tokenManage }) {
        this.tokenManage = tokenManage;
    }

    public async verifyToken(req: Request, res: Response, next: NextFunction) {
        const { headers: { authorization: auth } } = req;
        const [, token] = auth?.split(' ') || [];

        if (!token) {
            return next();
        }

        const user = await this.tokenManage.verifyToken(token);
        user?.id && (req['user'] = user);
        return next();
    }
}