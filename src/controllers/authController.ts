import { RequestHandler, Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

const User = require('../models/user');

export const getSignup: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const errorMessages: string[] = req.flash('error');
    let errorMessage: string | null = null;
    if (errorMessages.length > 0) {
        errorMessage = errorMessages[0];
    } else {
        errorMessage = null;
    }
    res.render('auth/signup', {
        pageTitle: 'Signup',
        path: '/signup',
        message: errorMessage,
    });
};

export const postSignup: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const {username, email, password, confirmPassword} = req.body;
    User.findOne({where: {email}})
        .then((user:any) => {
            if (user) {
                req.flash('error', 'Email is not available');
                return res.redirect('/signup');
            }
            if (password !== confirmPassword) {
                req.flash('error', 'Password does not match');
                return res.redirect('/signup');
            }
            return bcrypt.hash(password, 12)
                .then((hashedPassword: string) => {
                    const id: string = uuid();
                    return User.create({id, username, email, password: hashedPassword})
                        .then((user:any) => {
                            return user.createCart();
                        })
                        .then(() => {
                            res.redirect('/login');
                        })
                })
        })
        .catch((err:any) => {
            console.log(err);
        });
}

export const getLogin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const errorMessages: string[] = req.flash('error');
    let errorMessage: string | null = null;
    if (errorMessages.length > 0) {
        errorMessage = errorMessages[0];
    } else {
        errorMessage = null;
    }
    console.log(errorMessage);
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        message: errorMessage,
    });
};

export const postLogin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body;
    User.findOne({where: {email}})
        .then((user: any) => {
            if (!user) {
                req.flash('error', 'Invalid email or password');
                return res.redirect('/login');
            }
            bcrypt.compare(password, user.password)
                .then((doMatch: boolean) => {
                    if (doMatch) {
                        req.session.user = user;
                        req.session.isLoggedIn = true;
                        return req.session.save((err: any) => {
                            console.log(err);
                            res.redirect('/');
                        });
                    }
                    req.flash('error', 'Invalid email or password');
                    res.redirect('/login');
                })
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
