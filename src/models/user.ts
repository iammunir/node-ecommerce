import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = require('./database');

class User extends Model {
    id!: string;
    username!: string;
    email!: string;
    password!: string;
}

const user = User.init(
    {
        id: {
            type: DataTypes.STRING(128),
            allowNull: false,
            primaryKey: true,
        },
        username: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        },
        password: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
    },
    {
        tableName: "users",
        sequelize
    }
);

module.exports = user;
