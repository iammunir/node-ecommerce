import { RequestHandler, Response, Request, NextFunction } from 'express';

const Product = require('../models/product');

export const getAddProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    res.render('admin/add-product', {
        pageTitle: 'The Store - Add Product',
        path: '/admin/add-product',
        edit: false,
        product: null,
    });
};

export const postAddProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const newProduct = {
        id: new Date().getTime().toString(),
        title: req.body.title, 
        price: req.body.price,
        imageUrl: req.body.image_url,
        description: req.body.description
    }

    Product.create({
        id: newProduct.id,
        title: newProduct.title, 
        price: newProduct.price, 
        imageUrl: newProduct.imageUrl, 
        description: newProduct.description
    }).then((result: any) => {
        console.log('product has been created');
    }).catch((err: any) => {
        console.log(err);
    });

    res.redirect('/');
};  

export const getProducts: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    Product.findAll()
        .then((products: any) => {
            res.render('admin/myproducts', {
                pageTitle: 'The Store - My Products',
                products: products,
                path: '/admin/myproducts'
            });
        })
        .catch((err: any) => {
            console.log(err);
        });
}; 

export const getEditProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const id = req.params.productId;
    Product.findOne({where: {id: id}})
        .then((product: any) => {
            if (!product) {
                return res.status(404);
            }
            res.render('admin/add-product', {
                pageTitle: `The Store - Edit ${product.title}`,
                path: '/admin/myproducts',
                edit: true,
                product: product,
            });
        })
        .catch((err: any) => {
            console.log(err);
        });
    
};

export const postEditProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    console.log(req.body);
    const updatedProduct = {
        id: req.body.id,
        title: req.body.title, 
        price: req.body.price,
        imageUrl: req.body.image_url,
        description: req.body.description
    }
    Product.update(updatedProduct, {where: {id: updatedProduct.id}})
        .then((result: any) => {
            res.redirect('/admin/myproducts');
        })
        .catch((err: any) => {
            console.log(err);
        });
};

export const postDeleteProduct: RequestHandler = (req: Request, res: Response, next: NextFunction) => {
    const id = req.body.productId;
    Product.destroy({where: {id: id}})
        .then((result: any) => {
            res.redirect('/admin/myproducts');
        })
        .catch((err: any) => {
            console.log(err);
        });
};
