import { Router } from 'express';
import { getLastPosts } from '../services/post.service.js';

const apiController = Router();

apiController.get('/posts/top', async (req, res) => {
    const lastPosts = await getLastPosts();

    res.json(lastPosts);
});

export default apiController;