import { Router } from 'express';
import * as service from '@/controller/chat.controller';
import { authenticate } from '@/middleware/authenticate';

const chatRouter = Router();

chatRouter.use(authenticate);

chatRouter.route('/').get(service.getAllChat);

export default chatRouter;
