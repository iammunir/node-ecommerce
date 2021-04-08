import { RequestHandler, Response, Request, NextFunction } from 'express';
import { validationResult } from 'express-validator';
import { v4 as uuid } from 'uuid';

const Product = require('../models/product');

const ITEM_PER_PAGE = 3;

export const getAddProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.render('admin/add-product', {
        pageTitle: 'The Store - Add Product',
        path: '/admin/add-product',
        edit: false,
        hasError: false,
        message: null,
        validationErrors: [],
        product: null,
    });
};

export const postAddProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const { title, price, description } = req.body;
    const image = req.file;
    if (!image) {
        return res.status(422).render('admin/add-product', {
            pageTitle: 'The Store - Add Product',
            path: '/admin/add-product',
            edit: false,
            hasError: true,
            message: 'Attached file is not an image!',
            validationErrors: [],
            product: {
                id: '',
                title, 
                price,
                description,
            },
        });
    }

    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-product', {
            pageTitle: 'The Store - Add Product',
            path: '/admin/add-product',
            edit: false,
            hasError: true,
            message: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {
                id: '',
                title, 
                price,
                description,
            },
        });
    }

    req.currentUser.createProduct({
        id: uuid(),
        title, 
        price, 
        imageUrl: image.path, 
        description,
    })
    .then((result: any) => {
        console.log('product has been created');
        res.redirect('/');
    })
    .catch((err:any) => {
        console.log(err);
        const error = new Error(err);
        res.status(500);
        return next(error);
    });

};  

export const getProducts: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const page = +req.query.page! || 1;
    let totalProd: number;
    req.currentUser.getProducts()
        .then((products: any) => {
            totalProd = products.length;
            return req.currentUser.getProducts({
                limit: ITEM_PER_PAGE,
                offset: (page-1) * ITEM_PER_PAGE,
            })
        })
        .then((products: any) => {
            res.render('admin/myproducts', {
                pageTitle: 'The Store - My Products',
                products: products,
                path: '/admin/myproducts',
                currentPage: page,
                hasNextPage: (ITEM_PER_PAGE * page) < totalProd,
                hasPreviousPage: page > 1,
                nextPage: page + 1,
                previousPage: page - 1,
                lastPage: Math.ceil(totalProd / ITEM_PER_PAGE),
            });
        })
        .catch((err:any) => {
            console.log(err);
            const error = new Error(err);
            res.status(500);
            return next(error);
        });
}; 

export const getEditProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.productId;
    req.currentUser.getProducts({where: {id: id}})
        .then((products: any) => {
            const product = products[0];
            if (!product) {
                return res.status(404);
            }
            res.render('admin/add-product', {
                pageTitle: `The Store - Edit ${product.title}`,
                path: '/admin/myproducts',
                edit: true,
                hasError: false,
                message: null,
                validationErrors: [],
                product: product,
            });
        })
        .catch((err:any) => {
            console.log(err);
            const error = new Error(err);
            res.status(500);
            return next(error);
        });
    
};

export const postEditProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const { id, title, price, description } = req.body;
    const image = req.file;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(422).render('admin/add-product', {
            pageTitle: `The Store - Edit ${title}`,
            path: '/admin/add-product',
            edit: true,
            hasError: true,
            message: errors.array()[0].msg,
            validationErrors: errors.array(),
            product: {
                id,
                title, 
                price,
                description,
            },
        });
    }

    let updatedProduct;
    if (image) {
        updatedProduct = {
            id,
            title, 
            price,
            imageUrl: image.path,
            description,
        }
    } else {
        updatedProduct = {
            id,
            title, 
            price,
            description,
        }
    }
    
    Product.update(updatedProduct, 
        {where: {
            id: updatedProduct.id,
            UserId: req.currentUser.id
        }})
        .then((result: any) => {
            res.redirect('/admin/myproducts');
        })
        .catch((err:any) => {
            console.log(err);
            const error = new Error(err);
            res.status(500);
            return next(error);
        });
};

export const postDeleteProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const id = req.body.productId;
    Product.destroy({
        where: {
            id: id,
            UserId: req.currentUser.id
        }})
        .then((result: any) => {
            res.redirect('/admin/myproducts');
        })
        .catch((err:any) => {
            console.log(err);
            const error = new Error(err);
            res.status(500);
            return next(error);
        });
};
