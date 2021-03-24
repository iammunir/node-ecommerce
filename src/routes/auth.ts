import { Router } from 'express';

const authController = require('../controllers/authController'); 

const router = Router();

// GET /signup
router.get('/signup', authController.getSignup);

// POST /signup
router.post('/signup', authController.postSignup);

// GET /login
router.get('/login', authController.getLogin);

// POST /login
router.post('/login', authController.postLogin);

// POST /logout
router.post('/logout', authController.postLogout);

module.exports = router;