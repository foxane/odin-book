import { Router } from 'express';
import * as service from '@/controller/notif.controller';
import { authenticate } from '@/middleware/authenticate';

const notifRouter = Router();

notifRouter.use(authenticate);

notifRouter.route('/').get(service.getAll);

export default notifRouter;
