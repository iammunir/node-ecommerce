import { Router } from 'express';

const shopController = require('../controllers/shopController');

const router = Router();

router.get('/', shopController.getProducts);

router.get('/product/:productId', shopController.getProduct);

router.post('/add-to-cart', shopController.addToCart);

router.get('/cart', shopController.getCart);

router.get('/orders', shopController.getOrders);

router.get('/checkout', shopController.getCheckout);

router.get('/about', shopController.getAbout);

module.exports = router;
