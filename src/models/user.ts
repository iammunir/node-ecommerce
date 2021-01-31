import { Sequelize, Model, DataTypes } from 'sequelize';

const sequelize = require('./database');

class User extends Model {
    id!: string;
    name!: string;
    email!: string;
}

const user = User.init(
    {
        id: {
            type: DataTypes.STRING(128),
            allowNull: false,
            primaryKey: true,
        },
        name: {
            type: DataTypes.STRING(255),
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING,
            allowNull: false,
            unique: true,
        }
    },
    {
        tableName: "users",
        sequelize
    }
);

module.exports = user;
