import { Router } from 'express';

const shopController = require('../controllers/shopController');
const isAuth = require('../middlewares/isAuth');

const router = Router();

router.get('/', shopController.getProducts);

router.get('/product/:productId', shopController.getProduct);

router.post('/add-to-cart', isAuth, shopController.addToCart);

router.post('/delete-from-cart', isAuth, shopController.deleteFromCart);

router.get('/cart', isAuth, shopController.getCart);

router.post('/create-order', isAuth, shopController.postOrder);

router.get('/orders', isAuth, shopController.getOrders);

router.get('/invoice/:invoiceId', isAuth, shopController.getInvoice);

router.get('/checkout', isAuth, shopController.getCheckout);

router.get('/about', shopController.getAbout);

module.exports = router;
