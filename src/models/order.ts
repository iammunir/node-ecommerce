import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = require('./database');

class Order extends Model {
    public id!: string;
}

const order = Order.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
    },
    {
        tableName: "orders",
        sequelize,
    }
);

module.exports = order;
