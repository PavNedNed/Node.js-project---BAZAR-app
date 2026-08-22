export function currentPageMiddleware(req, res, next) {
    const pages = {
        '/': 'home',
        '/post/create': 'create',
        '/post/dashboard': 'catalog',
        '/auth/login': 'login',
        '/auth/register': 'register',
        '/auth/admin': 'admin',
        '/auth/profile': 'profile',
    };

    res.locals.currentPage = pages[req.path] || '';

    next();
}