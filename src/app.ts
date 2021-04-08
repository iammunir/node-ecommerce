import path from 'path';

import express, { Application, NextFunction, Request, Response } from 'express';
import session from 'express-session';
import connect from 'connect-session-sequelize';
import csurf from 'csurf';
import multer from 'multer'; 
const flash = require('connect-flash');

const internalError = require('./middlewares/internalErrorHandler');

const sequelize = require('./models/database');
const SequelizeStore = connect(session.Store);
const storeSession = new SequelizeStore({
    db: sequelize,
    tableName: 'session'
});

const csrfProtection = csurf();
const csrfMiddleware = require('./middlewares/authAndCsrfToken');

const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');
const Order = require('./models/order');
const OrderItem = require('./models/order-item');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const authRoutes = require('./routes/auth');
const errorController = require('./controllers/errorController');

const PORT = process.env.PORT || 3000;
const app: Application = express();

const storageOptions = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'productImages');
    },
    filename: function(req, file, cb) {
        cb(null, `${new Date().getTime().toString()}-${file.originalname}`);
    }
});

const filterOptions = (req: Request, file: Express.Multer.File, cb: (error: any, proceed: boolean) => void) => {
    if (file.mimetype === 'image/png' || file.mimetype === 'image/jpg' || file.mimetype === 'image/jpeg') {
        cb(null, true);
    } else {
        cb(null, false);
    }
}

app.use(express.json());
app.use(express.urlencoded({extended: false}));
app.use(multer({storage: storageOptions, fileFilter: filterOptions}).single('image'));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use('/productImages', express.static(path.join(__dirname, '..', 'productImages')));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: storeSession
}));

app.use(csrfProtection);
app.use(flash());
app.use(csrfMiddleware);

app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user) {
        return next();
    }
    User.findOne({
        where: {
            id: req.session.user.id
        }
    })
    .then((user: any) => {
        if (!user) {
            return next();
        }
        req.currentUser = user;
        next();
    })
    .catch((err:any) => {
        const error = new Error(err);
        res.status(500);
        next(error);
    });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

app.use(internalError);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product); // optional

Cart.belongsTo(User);
User.hasOne(Cart);

Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, {through: OrderItem, onDelete: 'SET NULL'});
Product.belongsToMany(Order, {through: OrderItem, onDelete: 'SET NULL'});

sequelize
    // .sync({force: true})
    .sync()
    .then(() => {
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch((err:any) => {
        throw new Error('Unable to connect with the database');
    });