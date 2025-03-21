import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MTournamentImage from "./tournamentImageModel.js";

class MTournamentOponent extends Model {
    public id!: number;
    public id_oponent!: number;
    public id_tournament_image!: number;
}

MTournamentOponent.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        id_oponent: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        id_tournament_image: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MTournamentImage,
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "MTournamentOponent",
        tableName: "tournament_oponent",
    },
);

MTournamentOponent.belongsTo(MTournamentImage, {
    foreignKey: "id_tournament_image",
    as: "tournamentImage",
    onDelete: "CASCADE",
});
MTournamentImage.hasMany(MTournamentOponent, {
    foreignKey: "id_tournament_image",
    as: "tournamentOponent",
    onDelete: "CASCADE",
});

export default MTournamentOponent;
