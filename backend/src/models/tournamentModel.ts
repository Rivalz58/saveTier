import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MAlbum from "./albumModel.js";
import MUser from "./userModel.js";

class MTournament extends Model {
    public id!: number;
    public name!: string;
    public description!: string;
    public turn!: number;
    public private!: boolean;
    public id_album!: number;
    public id_user!: number;
}

MTournament.init(
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
        description: {
            type: DataTypes.STRING(512),
            allowNull: true,
        },
        turn: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        private: {
            type: DataTypes.BOOLEAN,
            defaultValue: true,
            allowNull: false,
        },
        id_album: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MAlbum,
                key: "id",
            },
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
        modelName: "MTournament",
        tableName: "tournament",
    },
);

MTournament.belongsTo(MAlbum, {
    foreignKey: "id_album",
    as: "album",
    onDelete: "CASCADE",
});
MAlbum.hasMany(MTournament, {
    foreignKey: "id_album",
    as: "tournament",
    onDelete: "CASCADE",
});
MTournament.belongsTo(MUser, {
    foreignKey: "id_user",
    as: "author",
    onDelete: "CASCADE",
});
MUser.hasMany(MTournament, {
    foreignKey: "id_user",
    as: "tournaments",
    onDelete: "CASCADE",
});

export default MTournament;
