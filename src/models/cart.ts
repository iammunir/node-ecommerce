import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = require('./database');

class Cart extends Model {
    public id!: string;
}

const cart = Cart.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        tableName: "carts",
        sequelize,
    }
);

module.exports = cart;
