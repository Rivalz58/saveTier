import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MUser from "./userModel.js";

class MAlbum extends Model {
    public id!: number;
    public name!: string;
    public status!: string;
    public id_user!: number;
}

MAlbum.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(64),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(16),
            allowNull: false,
        },
        id_user: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MUser,
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "MAlbum",
        tableName: "album",
    },
);

MAlbum.belongsTo(MUser, {
    foreignKey: "id_user",
    as: "author",
    onDelete: "CASCADE",
});
MUser.hasMany(MAlbum, {
    foreignKey: "id_user",
    as: "albums",
    onDelete: "CASCADE",
});

export default MAlbum;
