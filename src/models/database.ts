import { Sequelize } from 'sequelize';
import { config } from 'dotenv';

config();
const username: string = process.env.DATABASE_USERNAME!;
const password: string = process.env.DATABASE_PASSWORD!;
const host: string = process.env.DATABASE_HOST!;
const port: number = +process.env.DATABASE_HOST!;

const sequelize: Sequelize = new Sequelize(
    'the_store',
    username,
    password,
    {dialect: 'mysql', host: host, port: port}
);

module.exports = sequelize;
