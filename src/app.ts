import express, { Application, Request, Response } from 'express';
import bodyParser from 'body-parser';
import path from 'path';

const sequelize = require('./models/database');
const Product = require('./models/product');

const adminRoutes = require('./routes/admin');
const shopRoutes = require('./routes/shop');
const errorController = require('./controllers/errorController');

const PORT = process.env.PORT || 3000;
const app: Application = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: false}));

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.static(path.join(__dirname, '..', 'public')));

app.use('/admin', adminRoutes);
app.use(shopRoutes);
app.use(errorController.get404);

sequelize.sync()
    .then((result: any) => {
        app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
    })
    .catch((err: any) => {
        console.log(err);
    })