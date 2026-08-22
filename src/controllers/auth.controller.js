import { Router } from 'express';
import * as z from 'zod';
import { createUserSchema, loginUserSchema } from '../schemas/auth.schema.js';
import { getErrorMessage } from '../utils/error.utils.js';
import { register, login, remove, getUserNameById } from '../services/auth.service.js';
import { createAuthToken } from '../utils/token.utils.js';
import { isAuthenticated, isGuest } from '../middlewares/auth.middleware.js';
import { getByUser, loadProfiles, getAll } from '../services/post.service.js';


const authController = Router();

authController.get('/register', isGuest, (req, res) => {
    res.render('auth/register');
});

authController.post('/register', isGuest, async (req, res) => {
    // console.log(req.body);

    try{
        const userData = await createUserSchema.parseAsync(req.body);
       //console.log("Successfully validated user data:");
        //console.log(userData);

        const result = await register(userData);

        const token = createAuthToken(result);

        res.cookie('auth', token, { httpOnly: true });

        res.redirect('/');
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        //console.log(errorMessage);
        res.status(400).render('auth/register', { error: errorMessage, data: req.body })
    }
});

authController.get('/login', isGuest, (req, res) => {
    res.render('auth/login');
});

authController.post('/login', isGuest, async (req, res) => {
    try {
        // dobavka
        const userData = await loginUserSchema.parseAsync(req.body);

        const { email, password } = userData; // vmesto req.body

        const user = await login(email, password);

        const token = createAuthToken(user);
        // console.log("Token created:", token);

        res.cookie('auth', token, { httpOnly: true });

        res.redirect('/');
    } catch (error) {
        const errorMessage = getErrorMessage(error);
        res.status(400).render('auth/login', { error: errorMessage, data: req.body });
    }
});

authController.get('/logout', isAuthenticated, (req, res) => {
    res.clearCookie('auth');
    res.redirect('/');
});

// admin
authController.get('/admin', isAuthenticated, async (req, res) => {

    const role = req.user ? req.user.role : null;
    // console.log(userName);
    if(role !== 'admin') {
        //console.log("error")
        return res.status(404).render('404', { error: 'You are not allowed to enter the admin panel' });
    }
    else {
        const profiles = await loadProfiles();
        const posts = await getAll();

        res.render('auth/admin', { profiles, posts });
    }
});

authController.get('/:userId/delete', isAuthenticated, async (req, res) => {
    const userId = req.params.userId;
    const role = req.user ? req.user.role : null;

    // tuk moje da trqbwa proverka za "admin"
    if(role !== 'admin') {
        //console.log("error")
        return res.status(404).render('404', { error: 'You are not allowed to delete this user' });
    }

    // CHECKS the admin panel deletion
    const userToBeDeleted = await getUserNameById(userId);
    // console.log(userToBeDeleted);
    console.log("userToBeDeleted: " + userToBeDeleted.role);
    if(userToBeDeleted.role === 'admin') {
        return res.status(404).render('404', { error: 'You are not allowed to delete the admin' });
    }

    await remove(userId);

    res.redirect('/auth/admin');
});

// profile
authController.get('/profile', isAuthenticated, async (req, res) => {

    const userId = req.user ? req.user.id : null;

    //console.log("userIdCheck:  " + userId);
    const posts = await getByUser(userId);

    res.render('auth/profile', { posts });
});



export default authController;