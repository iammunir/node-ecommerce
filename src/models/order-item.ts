import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = require('./database');

class OrderItem extends Model {
    public id!: string;
    public qty!: number;
    public price!: number;
}

const orderItem = OrderItem.init(
    {
        id: {
            type: DataTypes.INTEGER,
            autoIncrement: true,
            allowNull: false,
            primaryKey: true,
        },
        title: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        qty: {
            type: DataTypes.INTEGER,
            allowNull: false, 
        },
        price: {
            type: DataTypes.DOUBLE,
            allowNull: false
        }
    },
    {
        tableName: "orderItems",
        sequelize,
    }
);

module.exports = orderItem;
