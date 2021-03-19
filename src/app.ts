import express, { Application, NextFunction, Request, Response } from 'express';
import bodyParser from 'body-parser';
import session from 'express-session';
import connect from 'connect-session-sequelize';
import path from 'path';

const sequelizeDb = require('./models/database');
const SequelizeStore = connect(session.Store);
const storeSession = new SequelizeStore({
    db: sequelizeDb,
    tableName: 'session'
});

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

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, '..', 'public')));
app.use(session({
    secret: 'secret-key',
    resave: false,
    saveUninitialized: false,
    store: storeSession
}));

app.use((req: Request, res: Response, next: NextFunction) => {
    if (!req.session.user) {
        return next();
    }
    User.findOne({id: req.session.user.id})
        .then((user: any) => {
            req.currentUser = user;
            next();
        })
        .catch((err: any) => {
            console.log(err);
        });
});

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(authRoutes);
app.use(errorController.get404);

Product.belongsTo(User, {constraints: true, onDelete: 'CASCADE'});
User.hasMany(Product); // optional

Cart.belongsTo(User);
User.hasOne(Cart);

Cart.belongsToMany(Product, {through: CartItem});
Product.belongsToMany(Cart, {through: CartItem});

Order.belongsTo(User);
User.hasMany(Order);

Order.belongsToMany(Product, {through: OrderItem});
Product.belongsToMany(Order, {through: OrderItem});

let fetchedUser: any;
sequelizeDb
    // .sync({force: true})
    .sync()
    .then((result: any) => {
        return User.findOne({id: '1'});
    })
    .then((user: any) => {
        if (!user) {
            return User.create({id: '1', name: 'mmunir', email: 'test@test.com'})
        }
        return Promise.resolve(user);
    })
    .then((user: any) => {
        fetchedUser = user;
        return user.getCart();
    })
    .then((cart: any) => {
        if (!cart) {
            return fetchedUser.createCart()
        }
        return Promise.resolve(cart);
    })
    .then((cart: any) => {
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch((err: any) => {
        console.log(err);
    })