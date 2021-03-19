import { RequestHandler, Request, Response, NextFunction } from 'express';

const User = require('../models/user');

export const getLogin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {

    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        isAuthenticated: req.session.isLoggedIn,
    });
};

export const postLogin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    User.findOne({id: '1'})
        .then((user: any) => {
            req.session.user = user;
            req.session.isLoggedIn = true;
            req.session.save((err: any) => {
                console.log(err);
                res.redirect('/');
            });
        })
        .catch((err: any) => {
            console.log(err);
        });
};

export const postLogout: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    req.session.destroy(() => {
        res.redirect('/');
    });
};
