import { Router } from 'express';
import { getLatest } from '../services/post.service.js';

const homeController = Router();

homeController.get('/', async (req, res) => {
    const posts = await getLatest();

    res.render('home', { posts });
});

export default homeController;