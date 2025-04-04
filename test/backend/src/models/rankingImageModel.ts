import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MImage from "./imageModel.js";
import MRanking from "./rankingModel.js";

class MRankingImage extends Model {
    public id!: number;
    public points!: number;
    public viewed!: number;
    public disable!: boolean;
    public id_image!: number;
    public id_ranking!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

MRankingImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        points: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
        },
        viewed: {
            type: DataTypes.INTEGER,
            allowNull: false,
            defaultValue: 0,
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
        id_ranking: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MRanking,
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "MRankingImage",
        tableName: "ranking_image",
        timestamps: true,
    },
);

MRankingImage.belongsTo(MImage, { foreignKey: "id_image", as: "image" });
MRankingImage.belongsTo(MRanking, {
    foreignKey: "id_ranking",
    as: "ranking",
    onDelete: "CASCADE",
});
MImage.hasMany(MRankingImage, { foreignKey: "id_image", as: "rankingImage" });
MRanking.hasMany(MRankingImage, {
    foreignKey: "id_ranking",
    as: "rankingImage",
    onDelete: "CASCADE",
});

export default MRankingImage;
