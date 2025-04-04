import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MAlbum from "./albumModel.js";
import MUser from "./userModel.js";

class MRanking extends Model {
    public id!: number;
    public name!: string;
    public description!: string;
    public private!: boolean;
    public id_album!: number;
    public id_user!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

MRanking.init(
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
        modelName: "MRanking",
        tableName: "ranking",
        timestamps: true,
    },
);

MRanking.belongsTo(MAlbum, {
    foreignKey: "id_album",
    as: "album",
    onDelete: "CASCADE",
});
MAlbum.hasMany(MRanking, {
    foreignKey: "id_album",
    as: "ranking",
    onDelete: "CASCADE",
});
MRanking.belongsTo(MUser, {
    foreignKey: "id_user",
    as: "author",
    onDelete: "CASCADE",
});
MUser.hasMany(MRanking, {
    foreignKey: "id_user",
    as: "rankings",
    onDelete: "CASCADE",
});

export default MRanking;
