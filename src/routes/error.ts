import { Router } from 'express';

const errorController = require('../controllers/errorController'); 

const router = Router();

// GET /404
router.get('/404', errorController.get404);

// GET /500
router.get('/500', errorController.get500);

module.exports = router;