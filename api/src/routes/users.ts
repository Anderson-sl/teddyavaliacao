import { Router, Request, Response } from 'express';
import { UserModel } from '../model/user-model';
import { UserRepository } from '../repository/user-repository';
import { Database } from '../repository/connections/database-connection';
import { UserController } from '../http/user-controller';
const router = Router();
const databaseConnection = new Database();
const userRepository = new UserRepository({ databaseConnection });
const userModel = new UserModel({ userRepository });
const userController = new UserController({ userModel });

router.post('/', userController.save.bind(userController));

export default router;