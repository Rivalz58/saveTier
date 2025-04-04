import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MTournament from "./tournamentModel.js";
import MImage from "./imageModel.js";

class MTournamentImage extends Model {
    public id!: number;
    public lose!: boolean;
    public place!: number;
    public turn!: number;
    public disable!: boolean;
    public id_image!: number;
    public id_tournament!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

MTournamentImage.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        lose: {
            type: DataTypes.BOOLEAN,
            defaultValue: false,
            allowNull: false,
        },
        place: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        turn: {
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
        id_tournament: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MTournament,
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "MTournamentImage",
        tableName: "tournament_image",
        timestamps: true,
    },
);

MTournamentImage.belongsTo(MImage, { foreignKey: "id_image", as: "image" });
MTournamentImage.belongsTo(MTournament, {
    foreignKey: "id_tournament",
    as: "tournament",
    onDelete: "CASCADE",
});
MImage.hasMany(MTournamentImage, {
    foreignKey: "id_image",
    as: "tournamentImage",
});
MTournament.hasMany(MTournamentImage, {
    foreignKey: "id_tournament",
    as: "tournamentImage",
    onDelete: "CASCADE",
});

export default MTournamentImage;
