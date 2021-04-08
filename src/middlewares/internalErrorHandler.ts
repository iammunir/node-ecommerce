import { Request, Response, NextFunction } from 'express';

module.exports = (err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(500).render('error/500', {
        pageTitle: 'The Store - Internal Error',
        path: '/500',
        isAuthenticated: req.session?.isLoggedIn,
    });
}