import jwt from 'jsonwebtoken';
import { IUser } from '../../model/user-model';

export class TokenManage {
    private jwt: any;
    private salt: String;
    private exp: String; 
    constructor() {
        this.jwt = jwt;
        this.salt = String(process.env.TOKEN_SALT);
        this.exp = String(process.env.TOKEN_EXPIRE_IN);
    }

    async generateToken(user: IUser): Promise<void>   {
        try {
            return this.jwt.sing({
                id: user?.id,
                name: user?.name,
            }, this.salt, { expiresIn: this.exp });
        } catch(error) {
            
        }
    }

    /* async generateToken(req: Request, res: Response, next: NextFunction): Promise<void>   {
        const {
            headers: {
                authorization: auth,
            },
        } = req;
        const [,token] = auth?.split(' ');
        jw
    } */
}