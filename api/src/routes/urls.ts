import { Router } from 'express';
import { ManageUrlRepository } from '../repository/manage-url-repository';
import { ManageUrlModel } from '../model/manage-url-model';
import { ManageUrlController } from '../http/manage-url-controller';
import { ManageTokenMiddleware } from './middlewares/manage-token-middleware';
import { TokenManage } from '../utils/token/token-manage';

const routers = ({ logger, database }) => {
    const router = Router();
    const manageUrlRepository = new ManageUrlRepository({ databaseConnection: database, logger });
    const manageUrlModel = new ManageUrlModel({ manageUrlRepository, logger });
    const manageUrlController = new ManageUrlController({ manageUrlModel, logger });
    const tokenManage = new TokenManage({ logger });
    const manageTokenMiddleware = new ManageTokenMiddleware({ tokenManage });

    router.get(
        '/',
        manageTokenMiddleware.verifyToken.bind(manageTokenMiddleware),
        manageUrlController.list.bind(manageUrlController)
    );
    router.post(
        '/short',
        manageTokenMiddleware.verifyToken.bind(manageTokenMiddleware),
        manageUrlController.save.bind(manageUrlController)
    );
    router.delete(
        '/:id',
        manageTokenMiddleware.verifyToken.bind(manageTokenMiddleware),
        manageUrlController.delete.bind(manageUrlController)
    );
    return router;
};

export default routers;