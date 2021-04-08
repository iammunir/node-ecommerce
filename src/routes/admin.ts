import { Router } from 'express';
import { body } from 'express-validator';

const adminController = require('../controllers/adminController');
const isAuth = require('../middlewares/isAuth');

const router = Router();

// GET /admin/products
router.get('/myproducts', isAuth, adminController.getProducts);

// GET /admin/add-product
router.get('/add-product', isAuth, adminController.getAddProduct);

// POST /admin/add-product
router.post(
    '/add-product', 
    [
        body('title', 'Please input a valid title, minimum 3 characters and maximum 30 characters')
            .trim()
            .isString()
            .isLength({min: 3, max: 30}),
        body('price', 'Please input a valid numbers')
            .trim()
            .isFloat()
            .custom((value, {req}) => {
                if (value < 1) throw new Error('The price must be greater than zero!');
                return true;
            }),
        body('description', 'Please input a valid description, minimum 3 characters and maximum 200 characters')
            .trim()
            .isString()
            .isLength({min: 3, max: 200})
    ], 
    isAuth, 
    adminController.postAddProduct
    );

// GET /admin/edit-product/:productId
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// POST /admin/edit-product
router.post(
    '/edit-product', 
    [
        body('title', 'Please input a valid title, minimum 3 characters and maximum 30 characters')
            .trim()
            .isString()
            .isLength({min: 3, max: 30}),
        body('price', 'Please input a valid numbers')
            .trim()
            .isFloat()
            .custom((value, {req}) => {
                if (value < 1) throw new Error('The price must be greater than zero!');
                return true;
            }),
        body('description', 'Please input a valid description, minimum 3 characters and maximum 200 characters')
            .trim()
            .isString()
            .isLength({min: 3, max: 200})
    ],
    isAuth, 
    adminController.postEditProduct
    );

// POST /admin/delete-product
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
