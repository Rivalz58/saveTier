import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MUser from "./userModel.js";

class MRevocation extends Model {
    public id!: number;
    public id_user!: number;
    public revocation_date!: Date;
}

MRevocation.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MUser,
                key: "id",
            },
        },
        revocation_date: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "MRevocation",
        tableName: "revocation",
        timestamps: false,
    },
);

MRevocation.belongsTo(MUser, { foreignKey: "id_user", onDelete: "CASCADE" });
MUser.hasMany(MRevocation, { foreignKey: "id_user", onDelete: "CASCADE" });

export default MRevocation;
