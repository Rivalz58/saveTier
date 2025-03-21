import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class MRole extends Model {
    public id!: number;
    public libelle!: string;
}

MRole.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        libelle: {
            type: DataTypes.STRING(32),
            allowNull: false,
            unique: true,
        },
    },
    {
        sequelize,
        modelName: "MRole",
        tableName: "role",
        timestamps: false,
    },
);

export default MRole;
