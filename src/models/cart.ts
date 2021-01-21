import path from 'path';
import fs from 'fs';

const rootDir = require('../../utils/path');

const jsonPath = path.join(rootDir, 'dummydata', 'cart.json');

interface product {
    id: string;
    qty: number;
}

class MyCart {
    products: product[];
    totalPrice: number;
    constructor(products: product[], totalPrice: number) {
        this.products = products;
        this.totalPrice = totalPrice
    }
}

module.exports = class Cart {
    static addProduct(productId: string, price: number) {
        
        // fetch the previous cart
        fs.readFile(jsonPath, (err, fileContent): void => {
            const products: product[] = [];
            let cart = new MyCart(products, 0);
            if (!err) {
                cart =  JSON.parse(fileContent.toString());
            }

            // analyze the cart, to find the existing product
            const existingProductIndex: number = cart.products.findIndex(prod => prod.id === productId);
            const existingProdcut: product = cart.products[existingProductIndex];
            
            // add new product OR increase the quantity
            let updatedProduct: product;
            if (existingProdcut) {
                updatedProduct = {...existingProdcut};
                updatedProduct.qty = updatedProduct.qty + 1;
                cart.products = [...cart.products];
                cart.products[existingProductIndex] = updatedProduct;
            } else {
                updatedProduct = {id: productId, qty: 1};
                cart.products = [...cart.products, updatedProduct];
            }

            // calculate the price
            cart.totalPrice = cart.totalPrice + price;

            // save
            fs.writeFile(jsonPath, JSON.stringify(cart), (err) => {
                if (err) {
                    console.log(err);
                } else {
                    console.log('saved json');
                }
            })
        });
    }
}