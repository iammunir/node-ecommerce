import { Router } from 'express';

const authController = require('../controllers/authController'); 

const router = Router();

// GET /login
router.get('/login', authController.getLogin);

// POST /login
router.post('/login', authController.postLogin);

// POST /logout
router.post('/logout', authController.postLogout);

module.exports = router;