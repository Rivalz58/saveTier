import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MTierlistLine from "./tierlistLineModel.js";
import MImage from "./imageModel.js";

class MTierlistLineImage extends Model {
    public id!: number;
    public placement!: number;
    public disable!: boolean;
    public id_image!: number;
    public id_tierlist_line!: number;
}

MTierlistLineImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        placement: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        disable: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        id_image: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MImage,
                key: "id",
            },
        },
        id_tierlist_line: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MTierlistLine,
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "MTierlistLineImage",
        tableName: "tierlist_line_image",
    },
);

MTierlistLineImage.belongsTo(MImage, { foreignKey: "id_image", as: "image" });
MTierlistLineImage.belongsTo(MTierlistLine, {
    foreignKey: "id_tierlist_line",
    as: "tierlistLine",
    onDelete: "CASCADE",
});
MImage.hasMany(MTierlistLineImage, {
    foreignKey: "id_image",
    as: "tierlistLineImage",
});
MTierlistLine.hasMany(MTierlistLineImage, {
    foreignKey: "id_tierlist_line",
    as: "tierlistLineImage",
    onDelete: "CASCADE",
});

export default MTierlistLineImage;
