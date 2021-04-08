import fs from 'fs';
import path from 'path';
import { RequestHandler, Response, Request, NextFunction } from 'express';
import PDFDocument from 'pdfkit';

const Product = require('../models/product');
const Order = require('../models/order');

const ITEM_PER_PAGE = 3;

export const getProducts: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const page = +req.query.page! || 1;
    
    Product.findAndCountAll({
        limit: ITEM_PER_PAGE,
        offset: (page-1) * ITEM_PER_PAGE,
    })
        .then((result: any) => {
            res.render('shop/shop', {
                pageTitle: 'The Store - Home',
                products: result.rows,
                path: '/',
                currentPage: page,
                hasNextPage: (ITEM_PER_PAGE * page) < result.count,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(result.count / ITEM_PER_PAGE),
            });
        })
        .catch((err:any) => {
            const error = new Error(err);
            res.status(500);
            next(error);
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
        .catch((err:any) => {
            const error = new Error(err);
            res.status(500);
            next(error);
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
            return fetchedCart.addProduct(product, {through: {title: product.title, qty: newQuantity, price: newPrice}})
        })
        .then(() => {
            res.redirect('/cart');
        })
        .catch((err:any) => {
            const error = new Error(err);
            res.status(500);
            next(error);
        });
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
        .catch((err:any) => {
            const error = new Error(err);
            res.status(500);
            next(error);
        });
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
        })
        .catch((err:any) => {
            const error = new Error(err);
            res.status(500);
            next(error);
        });


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
                        product.OrderItem = {qty: product.CartItem.qty, title: product.CartItem.title, price: product.CartItem.price};
                        return product;
                    }));
                })
        })
        .then(() => {
            fetchedCart.setProducts(null);
        })
        .then(() => {
            res.redirect('/orders');
        })
        .catch((err:any) => {
            const error = new Error(err);
            res.status(500);
            next(error);
        });
};

export const getOrders: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    req.currentUser.getOrders({include: Product})
        .then((orders: any) => {
            res.render('shop/orders', {
                pageTitle: 'The Store - Orders',
                path: '/orders',
                orders: orders,
            });
        })
        .catch((err:any) => {
            const error = new Error(err);
            res.status(500);
            next(error);
        });
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

export const getInvoice: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const invoiceId = req.params.invoiceId;
    Order.findOne({where: {id: invoiceId}, include: Product})
        .then((order: any) => {
            if (!order) {
                return next(new Error('No order found'));
            }
            if (order.UserId !== req.currentUser.id) {
                return next(new Error('Unauthorized'));
            }

            const invoiceName = `invoice-${invoiceId}.pdf`;
            const invoicePath = path.join('data', 'invoices', invoiceName);

            res.setHeader('Content-Type', 'application/pdf');
            res.setHeader('Content-Disposition', `inline; filename="${invoiceName}"`);

            const pdfDoc = new PDFDocument();
            pdfDoc.pipe(fs.createWriteStream(invoicePath));
            pdfDoc.pipe(res);
            
            pdfDoc.fontSize(26).text(`Invoice #${invoiceId}`, {
                underline: true
              });
            pdfDoc.text('=======================');
            let totalPrice = 0;
            order.Products.forEach((product: any) => {
                totalPrice += product.OrderItem.price;
                pdfDoc.fontSize(14).text(`${product.title} - ${product.OrderItem.qty} x $${product.OrderItem.price}`);
            });
            pdfDoc.text('-----------------------');
            pdfDoc.fontSize(20).text('Total Price: $' + totalPrice);

            pdfDoc.end();
        })
        .catch((err:any) => {
            const error = new Error(err);
            res.status(500);
            next(error);
        });
};
