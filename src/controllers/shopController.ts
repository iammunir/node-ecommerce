import { RequestHandler, Response, Request, NextFunction } from 'express';

const Product = require('../models/product');

export const getProducts: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    
    Product.findAll()
        .then((products: any) => {
            res.render('shop/shop', {
                pageTitle: 'The Store - Home',
                products: products,
                path: '/',
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
                path: '/',
                
            })
        })
        .catch((err: any) => {
            console.log(err);
        });
};

export const addToCart: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const prodId = req.body.productId;
    let fetchedCart: any;
    let newQuantity = 1;
    
    req.currentUser.getCart()
        .then((cart: any) => {
            fetchedCart = cart;
            return cart.getProducts({where: {id: prodId}})
        })
        .then((products: any) => {
            
            let product: any;
            if(products.length > 0) {
                product = products[0];
            }
            
            if (product) {
                newQuantity = product.CartItem.qty + 1;
                return product;
            }

            return Product.findOne({where: {id: prodId}});
                
        })
        .then((product: any) => {
            const newPrice = product.price * newQuantity;
            return fetchedCart.addProduct(product, {through: {qty: newQuantity, price: newPrice}})
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch((err: any) => console.log(err));
};

export const deleteFromCart: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const prodId = req.body.productId;
    req.currentUser.getCart()
        .then((cart: any) => {
            return cart.getProducts({where: {id: prodId}})
        })
        .then((products: any) => {
            const product = products[0];
            return product.CartItem.destroy();
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch((err: any) => console.log(err));
}; 

export const getCart: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    req.currentUser.getCart()
        .then((cart: any) => {
            return cart.getProducts()
                .then((products: any) => {
                    res.render('shop/cart', {
                        pageTitle: 'The Store - Cart',
                        path: '/cart',
                        products: products,
                        
                    });
                })
                .catch((err: any) => console.log(err));
        })
        .catch((err: any) => console.log(err));


};

export const postOrder: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    let fetchedCart: any;
    req.currentUser.getCart()
        .then((cart: any) => {
            fetchedCart = cart;
            return cart.getProducts();
        })
        .then((products: any) => {
            return req.currentUser.createOrder()
                .then((order: any) => {
                    order.addProducts(products.map((product: any) => {
                        product.OrderItem = {qty: product.CartItem.qty, price: product.CartItem.price};
                        return product;
                    }));
                })
                .catch((err: any) => console.log(err));
        })
        .then(() => {
            fetchedCart.setProducts(null);
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch((err: any) => console.log(err));
};

export const getOrders: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    req.currentUser.getOrders({include: Product})
        .then((orders: any) => {
            if (orders.length > 0) {

            }
            res.render('shop/orders', {
                pageTitle: 'The Store - Orders',
                path: '/orders',
                orders: orders,
                
            });
        })
        .catch((err: any) => console.log(err));
};

export const getCheckout: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.render('shop/checkout', {
        pageTitle: 'The Store - Checkout',
        path: '/cart',
        
    });
};

export const getAbout: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.render('shop/about', {
        pageTitle: 'The Store - About',
        path: '/about',
        
    });
};
