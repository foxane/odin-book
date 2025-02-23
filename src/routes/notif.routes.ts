import { Router } from 'express';
import * as service from '@/controller/notif.controller';
import { authenticate } from '@/middleware/authenticate';

const notifRouter = Router();

notifRouter.use(authenticate);

notifRouter.route('/read-all').patch(service.readAll);
notifRouter.route('/:notifId/read').patch(service.read);
notifRouter.route('/').get(service.getAll).delete(service.deleteAll);

export default notifRouter;
