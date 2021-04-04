import crypto from 'crypto';
import { RequestHandler, Request, Response, NextFunction } from 'express';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';
import nodemailer from 'nodemailer'
import { Op } from 'sequelize';
import { config } from 'dotenv';
import { validationResult } from 'express-validator';

const User = require('../models/user');

config();
const email_host: string = process.env.EMAIL_HOST!;
const email_port: number = +process.env.EMAIL_PORT!;
const email_user: string = process.env.EMAIL_USER!;
const email_pass: string = process.env.EMAIL_PASS!;
const email_mail: string = process.env.EMAIL_MAIL!;
const transporter = nodemailer.createTransport({
    host: email_host,
    port: email_port,
    auth: {
        user: email_user,
        pass: email_pass
    }
});

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
        prevInputs: null,
    });
};

export const postSignup: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const {username, email, password, confirmPassword} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('auth/signup', {
            pageTitle: 'Signup',
            path: '/signup',
            message: errors.array()[0].msg,
            prevInputs: {username, email, password, confirmPassword}
        });
    }

    bcrypt.hash(password, 12)
        .then((hashedPassword: string) => {
            const id: string = uuid();
            return User.create({id, username, email, password: hashedPassword})
                .then((user:any) => {
                    return user.createCart();
                })
                .then(() => {
                    res.redirect('/login');
                    const mailOptions = {
                        from: email_mail,
                        to: email,
                        subject: 'Sign up to Node-Ecommerce',
                        html: `
                            <h1>You have successfully sign up</h1>
                            `
                        };
                    return transporter.sendMail(mailOptions);
                })
        })
        .catch((err:any) => {
            console.log(err);
        });
};

export const getLogin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const errorMessages: string[] = req.flash('error');
    let errorMessage: string | null = null;
    if (errorMessages.length > 0) {
        errorMessage = errorMessages[0];
    } else {
        errorMessage = null;
    }
    res.render('auth/login', {
        pageTitle: 'Login',
        path: '/login',
        message: errorMessage,
        prevInputs: null,
    });
};

export const postLogin: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const {email, password} = req.body;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        res.status(422).render('auth/login', {
            pageTitle: 'Login',
            path: '/login',
            message: errors.array()[0].msg,
            prevInputs: {email, password},
        });
    }

    User.findOne({where: {email}})
        .then((user: any) => {
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

export const getReset: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const errorMessages: string[] = req.flash('error');
    let errorMessage: string | null = null;
    if (errorMessages.length > 0) {
        errorMessage = errorMessages[0];
    } else {
        errorMessage = null;
    }
    res.render('auth/reset', {
        pageTitle: 'Reset',
        path: '/reset',
        message: errorMessage,
    });
};

export const postReset: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const {email} = req.body;
    User.findOne({where: {email}})
        .then((user: any) => {
            if (!user) {
                req.flash('error', 'Email is not registered');
                return res.redirect('/reset');
            }
            crypto.randomBytes(32, (err, buffer) => {
                if (err) {
                    console.log(err);
                    res.redirect('/reset');
                }
                const token = buffer.toString('hex');
                user.resetToken = token;
                user.resetTokenExp = Date.now() + 3600000;
                return user.save()
                    .then(() => {
                        const mailOptions = {
                            from: '89f4584a27-51ac2b@inbox.mailtrap.io',
                            to: email,
                            subject: 'Reset Password - Node-Ecommerce',
                            html: `
                                <p>You have requested to reset your password</p>
                                <p>Please click this <a href='localhost:3000/reset/${token}' target="_blank">link</a> to set a new password</p>
                                `
                          };
                        res.redirect('/');
                        return transporter.sendMail(mailOptions);
                    });
            });
        })
        .catch((err: any) => {
            console.log(err);
        });
};

export const getNewPassword: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const token = req.params.token;
    const errorMessages: string[] = req.flash('error');
    let errorMessage: string | null = null;
    if (errorMessages.length > 0) {
        errorMessage = errorMessages[0];
    } else {
        errorMessage = null;
    }

    User.findOne({
        where: {
            resetToken: token,
            resetTokenExp: {
                [Op.gt]: Date.now()
            }
        }
    })
    .then((user: any) => {
        res.render('auth/new-password', {
            pageTitle: 'Set a New Password',
            path: '/new-password',
            message: errorMessage,
            userId: user.id,
            passwordToken: token
        });
    })
    .catch((err: any) => {
        console.log(err);
    });
};

export const postNewPassword: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const { passwordToken, userId, newPassword, confirmNewPassword } = req.body;
    let resetUser: any;
    if (newPassword !== confirmNewPassword) {
        req.flash('error', 'Password does not match');
        return res.redirect(`/reset/${passwordToken}`);
    }

    User.findOne({
        where: {
            id: userId,
            resetToken: passwordToken,
            resetTokenExp: {
                [Op.gt]: Date.now()
            }
        }
    })
    .then((user: any) => {
        resetUser = user;
        return bcrypt.hash(newPassword, 12);
    })
    .then((hashedPassword: string) => {
        resetUser.password = hashedPassword;
        resetUser.resetToken = null;
        resetUser.resetTokenExp = null;
        return resetUser.save();
    })
    .then(() => {
        res.redirect('/login');
    })
    .catch((err: any) => {
        console.log(err);
    });
};
