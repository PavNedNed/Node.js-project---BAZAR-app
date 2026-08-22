import { Router } from 'express';

import homeController from './controllers/home.controller.js';
import authController from './controllers/auth.controller.js';
import postController from './controllers/post.controller.js';
import apiController from './controllers/api.controller.js';

const routes = Router();

routes.use('/', homeController);
routes.use('/auth', authController);
routes.use('/post', postController);

// API ROUTES
routes.use('/api', apiController);

// 404 route
routes.use((req, res) => {
    res.status(404).render('404');
});

export default routes;