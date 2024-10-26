import { Router } from 'express';
import { ManageUrlRepository } from '../repository/manage-url-repository';
import { ManageUrlModel } from '../model/manage-url-model';
import { ManageUrlController } from '../http/manage-url-controller';

const routers = ({ logger, database }) => {
    const router = Router();
    const manageUrlRepository = new ManageUrlRepository({ databaseConnection: database, logger });
    const manageUrlModel = new ManageUrlModel({ manageUrlRepository, logger });
    const manageUrlController = new ManageUrlController({ manageUrlModel, logger });

    router.get('/:short', manageUrlController.index.bind(manageUrlController));
    return router;
};

export default routers;