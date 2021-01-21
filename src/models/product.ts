import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = require('./database');

class Product extends Model {
    public id!: string;
    public title!: string;
    public price!: number;
    public imageUrl!: string;
    public description!: string;
}

const product = Product.init(
    {
        id: {
            type: DataTypes.STRING(128),
            allowNull: false,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false,
        },
        imageUrl: {
            type: DataTypes.STRING,
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING,
            allowNull: false,
        }
    },
    {
        tableName: "products",
        sequelize,
    }
);

module.exports = product;
