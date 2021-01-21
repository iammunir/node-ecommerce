import { Sequelize } from 'sequelize';


const sequelize: Sequelize = new Sequelize(
    'the_store',
    'root',
    '',
    {dialect: 'mysql', host: 'localhost', port: 3306}
);

module.exports = sequelize;
