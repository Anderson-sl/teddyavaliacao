import { Router } from 'express';
import { UserModel } from '../model/user-model';
import { UserRepository } from '../repository/user-repository';
import { AuthController } from '../http/auth-controller';
import { PasswordHash } from '../utils/password/password-hash';
import { TokenManage } from '../utils/token/token-manage';

const routers = ({ logger, database }) => {
    const router = Router();
    const userRepository = new UserRepository({ databaseConnection: database, logger });
    const passwordHash = new PasswordHash({ logger });
    const tokenManage = new TokenManage({ logger });
    const userModel = new UserModel({ userRepository, logger, passwordHash, tokenManage });
    const authController = new AuthController({ userModel, logger });

    router.post('/login', authController.login.bind(authController));
    return router;
};

export default routers;