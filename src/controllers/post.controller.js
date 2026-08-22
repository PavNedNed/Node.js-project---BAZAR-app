import { Router } from 'express';
import { isAuthenticated } from '../middlewares/auth.middleware.js';
import { getErrorMessage } from '../utils/error.utils.js';
import { createPostSchema } from '../schemas/post.schema.js';
import { create, getAll, getById, follow, unfollow, remove, update } from '../services/post.service.js';

const postController = Router();

// OPTIONS
function getCategoryOptions(post = {}) {
    const categories = ['Select category...', 'Vehicles', 'Electronics', 'Furniture', 'Clothes', 'Other'];

    const options = categories.map(stage => ({
        value: stage,
        selected: post.category === stage ? 'selected' : '',
    }));

    //console.log("post.stage", post.stage);

    return options;
}

postController.get('/dashboard', async (req, res) => {
    const posts = await getAll();

    res.render('post/dashboard', { posts });

});

postController.get('/create', isAuthenticated, (req, res) => {
    res.render('post/create', { categoryOptions: getCategoryOptions(req.body) });
});

postController.post('/create', isAuthenticated, async (req, res) => {
    const userId = req.user.id;
    //console.log("userID: ", userId);

    try {
        const postData = await createPostSchema.parseAsync(req.body);

        // moje bez promenlivata ... vij
        const result = await create(postData, userId);

        //console.log(postData);

        res.redirect('/post/dashboard');
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        //console.log(errorMessage);

        return res.status(400).render('post/create', { error: errorMessage, post: req.body, categoryOptions: getCategoryOptions(req.body) });
    }
});

postController.get('/:postId', async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user ? req.user.id : null;

    const post = await getById(postId);

    if (!post) {
        return res.status(404).render('404', { error: 'Post not found' });
    }

    const isOwner = post.authorId === userId;
    const hasFollowed = post.followers.some(x => x.id === userId);
    const followsCount = post.followers.length;

    // date
    const date = new Date(post.createdAt);
    const dateFormatted = `${date.getDate()}.${date.getMonth() + 1}.${date.getFullYear()}`;

    res.render('post/details', { post, isOwner, hasFollowed, followsCount, dateFormatted });
});

postController.get('/:postId/follow', isAuthenticated, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    try {
        const post = await getById(postId);
        if (!post) {
            return res.status(404).render('404', { error: 'Post not found' });
        }
        if (post.authorId === userId) {
            return res.status(403).render('404', { error: 'You cannot follow your own post' });
        }

        await follow(postId, userId);

        res.redirect(`/post/${postId}`);
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return res.status(400).render('404', { error: errorMessage });
    }

});

postController.get('/:postId/unfollow', isAuthenticated, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    try {
        const post = await getById(postId);
        if (!post) {
            return res.status(404).render('404', { error: 'Post not found' });
        }
        if (post.authorId === userId) {
            return res.status(403).render('404', { error: 'You cannot unfollow your own post' });
        }

        await unfollow(postId, userId);

        res.redirect(`/post/${postId}`);
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        return res.status(400).render('404', { error: errorMessage });
    }

});

postController.get('/:postId/delete', isAuthenticated, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;
    const role = req.user.role;

    const post = await getById(postId);

    if (!post) {
        return res.status(404).render('404', { error: 'Post not found' });
    }

    // zapomni - tuk e authorId, a ne userId
    const isOwner = post.authorId === userId || role === "admin";

    if (!isOwner) {
        return res.status(403).render('404', { error: 'You are not authorized to delete this post' });
    }

    // delete the post
    await remove(postId, userId, role);


    const referer = req.get('Referer') || '';
    if (referer.includes('/auth/admin')) {
        res.redirect('/auth/admin');
    } else {
        res.redirect('/post/dashboard');
    }
});

postController.get('/:postId/edit', isAuthenticated, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await getById(postId);

    if (!post) {
        return res.status(404).render('404', { error: 'Post not found' });
    }

    // zapomni - tuk e authorId, a ne userId
    const isOwner = post.authorId === userId;

    if (!isOwner) {
        return res.status(403).render('404', { error: 'You are not authorized to edit this post' });
    }

    res.render('post/edit', { post, isOwner, categoryOptions: getCategoryOptions(post) });
});

postController.post('/:postId/edit', isAuthenticated, async (req, res) => {
    const postId = req.params.postId;
    const userId = req.user.id;

    const post = await getById(postId);

    if (!post) {
        return res.status(404).render('404', { error: 'Post not found' });
    }

    const isOwner = post.authorId === userId;

    if (!isOwner) {
        return res.status(403).render('404', { error: 'You are not authorized to edit this post' });
    }

    try {
        const postData = await createPostSchema.parseAsync(req.body);
        await update(postId, postData, userId);

        res.redirect(`/post/${postId}`);
    } catch (error) {
        const errorMessage = getErrorMessage(error);

        return res.status(400).render('post/edit', {
            error: errorMessage,
            post: { ...req.body, id: postId },
            categoryOptions: getCategoryOptions(req.body),
        });
        // return res.status(400).render('post/edit', { error: errorMessage, post: req.body, categoryOptions: getCategoryOptions(req.body) });
    }
});

export default postController;