import { Router, Request, Response } from 'express';
import { UserModel } from '../model/user-model';
import { UserRepository } from '../repository/user-repository';
import { Database } from '../repository/connections/database-connection';
import { UserController } from '../http/user-controller';
import { PasswordHash } from '../utils/password/password-hash';

const routers = ({ logger }) => {
    const router = Router();
    const databaseConnection = new Database({ logger });
    const userRepository = new UserRepository({ databaseConnection, logger });
    const passwordHash = new PasswordHash({ logger });
    const userModel = new UserModel({ userRepository, logger, passwordHash });
    const userController = new UserController({ userModel, logger });

    router.post('/', userController.save.bind(userController));
    return router;
};

export default routers;