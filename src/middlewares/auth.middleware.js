import jwt from 'jsonwebtoken';
import { getUserNameById } from '../services/auth.service.js';

export async function authMiddleware(req, res, next) {
    const token = req.cookies['auth'];
    if (!token) {
        return next();
    }
    
    try {
        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        const existingUser = await getUserNameById(decodedToken.id);
        if (!existingUser) {
            res.clearCookie('auth');
            return next();
        }
        req.user = decodedToken;
        res.locals.user = decodedToken;
        res.locals.isAdmin = existingUser.role === 'admin';
        next();
    } catch (error) {
        console.log('Invalid token:', error.message);
        res.clearCookie('auth');
        return res.redirect('/auth/login');
    }
}

export function isAuthenticated(req, res, next) {
    if(!req.user) {
        return res.redirect('/auth/login');
    }

    next();
}

export function isGuest(req, res, next) {
    if(req.user) {
        return res.redirect('/');
    }

    next();
}