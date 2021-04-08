import { Router } from 'express';
import { body, check } from 'express-validator';

const authController = require('../controllers/authController'); 
const User = require('../models/user');

const router = Router();

// GET /signup
router.get('/signup', authController.getSignup);

// POST /signup
router.post(
    '/signup',
    body('username', 'Please input valid username, numbers or alphabets at least 3 characters')
        .trim()
        .isLength({min: 3})
        .isAlphanumeric(), 
    check('email')
        .isEmail().withMessage('Please enter valid email')
        .custom((value: string, {req}) => {
            return User.findOne({where: {email: value}})
                .then((user:any) => {
                    if (user) {
                        return Promise.reject('Email is not available')
                    }
                })
        })
        .normalizeEmail(),
    body('password', 'Please input only numbers or alphabets and at least 6 characters')
        .trim()
        .isLength({min: 6})
        .isAlphanumeric(),
    body('confirmPassword')
        .trim()
        .custom((value: string, {req}) => {
            if (value !== req.body.password) {
                throw new Error('Password does not match!');
            }
            return true;
        }),
    authController.postSignup
    );

// GET /login
router.get('/login', authController.getLogin);

// POST /login
router.post(
    '/login',
    check('email')
        .isEmail().withMessage('Please enter valid email')
        .custom((value: string, {req}) => {
            return User.findOne({where: {email: value}})
                .then((user:any) => {
                    if (!user) {
                        return Promise.reject('Invalid email or password')
                    }
                })
        })
        .normalizeEmail(),
    authController.postLogin
    );

// POST /logout
router.post('/logout', authController.postLogout);

// GET /reset
router.get('/reset', authController.getReset);

// POST /reset-password
router.post('/reset-password', authController.postReset);

// GET /reset/<token>
router.get('/reset/:token', authController.getNewPassword);

// POST /new-password
router.post('/new-password', authController.postNewPassword);

module.exports = router;