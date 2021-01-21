import { RequestHandler, Response, Request, NextFunction } from 'express';

const Product = require('../models/product');
const Cart = require('../models/cart');


export const getProducts: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    
    Product.findAll()
        .then((products: any) => {
            res.render('shop/shop', {
                pageTitle: 'The Store - Home',
                products: products,
                path: '/'
            });
        })
        .catch((err: any) => {
            console.log(err);
        });

};

export const getProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.productId;
    Product.findOne({where: {id: id}})
        .then((product: any) => {
            res.render('shop/product-detail', {
                pageTitle: `The Store - ${product.title}`,
                product: product,
                path: '/'
            })
        })
        .catch((err: any) => {
            console.log(err);
        });
};

export const addToCart: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const id = req.body.productId;
    Product.findOne({where: {id: id}})
        .then((product: any) => {
            Cart.addProduct(product.id, product.price);
            res.redirect('/cart');
        })
        .catch((err: any) => {
            console.log(err);
        });
};

export const getCart: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.render('shop/cart', {
        pageTitle: 'The Store - Cart',
        path: '/cart'
    });
};

export const getOrders: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.render('shop/orders', {
        pageTitle: 'The Store - Orders',
        path: '/orders'
    });
};

export const getCheckout: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.render('shop/checkout', {
        pageTitle: 'The Store - Checkout',
        path: '/cart'
    });
};

export const getAbout: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.render('shop/about', {
        pageTitle: 'The Store - About',
        path: '/about'
    });
};
