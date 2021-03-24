import { Router } from 'express';

const adminController = require('../controllers/adminController');
const isAuth = require('../middlewares/isAuth');

const router = Router();

// GET /admin/products
router.get('/myproducts', isAuth, adminController.getProducts);

// GET /admin/add-product
router.get('/add-product', isAuth, adminController.getAddProduct);

// POST /admin/add-product
router.post('/add-product', isAuth, adminController.postAddProduct);

// GET /admin/edit-product/:productId
router.get('/edit-product/:productId', isAuth, adminController.getEditProduct);

// POST /admin/edit-product
router.post('/edit-product', isAuth, adminController.postEditProduct);

// POST /admin/delete-product
router.post('/delete-product', isAuth, adminController.postDeleteProduct);

module.exports = router;
