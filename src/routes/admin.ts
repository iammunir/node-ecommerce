import { Router } from 'express';

const adminController = require('../controllers/adminController');

const router = Router();

// GET /admin/products
router.get('/myproducts', adminController.getProducts);

// GET /admin/add-product
router.get('/add-product', adminController.getAddProduct);

// POST /admin/add-product
router.post('/add-product', adminController.postAddProduct);

// GET /admin/edit-product/:productId
router.get('/edit-product/:productId', adminController.getEditProduct);

// POST /admin/edit-product
router.post('/edit-product', adminController.postEditProduct);

// POST /admin/delete-product
router.post('/delete-product', adminController.postDeleteProduct);

module.exports = router;
