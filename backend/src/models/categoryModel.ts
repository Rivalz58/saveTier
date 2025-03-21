import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class MCategory extends Model {
    public id!: number;
    public name!: string;
}

MCategory.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: "MCategory",
        tableName: "category",
        timestamps: false,
    },
);

export default MCategory;
