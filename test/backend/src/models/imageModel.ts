import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MAlbum from "./albumModel.js";

class MImage extends Model {
    public id!: number;
    public name!: string;
    public path_image!: string;
    public description!: string;
    public url!: string;
    public id_album!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

MImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        name: {
            type: DataTypes.STRING(32),
            allowNull: false,
        },
        path_image: {
            type: DataTypes.STRING(1024),
            allowNull: false,
        },
        description: {
            type: DataTypes.STRING(512),
            allowNull: true,
        },
        url: {
            type: DataTypes.STRING(1024),
            allowNull: true,
        },
        id_album: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MAlbum,
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "MImage",
        tableName: "image",
        timestamps: true,
    },
);

MImage.belongsTo(MAlbum, {
    foreignKey: "id_album",
    as: "album",
    onDelete: "CASCADE",
});
MAlbum.hasMany(MImage, {
    foreignKey: "id_album",
    as: "image",
    onDelete: "CASCADE",
});

export default MImage;
