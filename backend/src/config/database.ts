import { Sequelize } from "sequelize";
import dotenv from "dotenv";

dotenv.config();

const sequelize = new Sequelize({
    host: process.env.DB_HOST,
    database: process.env.DB_NAME as string,
    username: process.env.DB_USER as string,
    password: process.env.DB_PASSWORD as string,
    dialect: "mariadb",
    logging: false,
});

export default sequelize;
