import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";
import MTierlist from "./tierlistModel.js";

class MTierlistLine extends Model {
    public id!: number;
    public label!: string;
    public placement!: number;
    public color!: string;
    public id_tierlist!: number;
    public createdAt!: Date;
    public updatedAt!: Date;
}

MTierlistLine.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        label: {
            type: DataTypes.STRING(32),
            allowNull: true,
        },
        placement: {
            type: DataTypes.INTEGER,
            allowNull: false,
        },
        color: {
            type: DataTypes.STRING(6),
            allowNull: false,
        },
        id_tierlist: {
            type: DataTypes.INTEGER,
            allowNull: false,
            references: {
                model: MTierlist,
                key: "id",
            },
        },
    },
    {
        sequelize,
        modelName: "MTierlistLine",
        tableName: "tierlist_line",
        timestamps: true,
    },
);

MTierlistLine.belongsTo(MTierlist, {
    foreignKey: "id_tierlist",
    as: "tierlist",
    onDelete: "CASCADE",
});
MTierlist.hasMany(MTierlistLine, {
    foreignKey: "id_tierlist",
    as: "tierlistLine",
    onDelete: "CASCADE",
});

export default MTierlistLine;
