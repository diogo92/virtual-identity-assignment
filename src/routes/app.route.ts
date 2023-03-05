import { Router } from 'express';
import { AppController } from '../controllers/app.controller';

const router = Router();

router.post('/', AppController.getShortenedUrl);
router.post('/login', AppController.login);
router.post('/logout', AppController.logout);
router.get('/:shortenedUrl', AppController.redirectToUrl);

export { router as AppRouter };