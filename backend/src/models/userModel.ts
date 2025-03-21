import { Model, DataTypes } from "sequelize";
import sequelize from "../config/database.js";

class MUser extends Model {
    public id!: number;
    public username!: string;
    public nametag!: string;
    public email!: string;
    public password!: string;
    public status!: string;
    public last_connexion!: Date;

    public toSafeJSON() {
        const { id, password, ...safeAttributes } = this.toJSON();
        return safeAttributes;
    }
}

MUser.init(
    {
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            autoIncrement: true,
        },
        username: {
            type: DataTypes.STRING(16),
            allowNull: false,
        },
        nametag: {
            type: DataTypes.STRING(16),
            unique: true,
            allowNull: false,
        },
        email: {
            type: DataTypes.STRING(64),
            allowNull: false,
            unique: true,
            validate: {
                isEmail: true,
            },
        },
        password: {
            type: DataTypes.STRING(128),
            allowNull: false,
        },
        status: {
            type: DataTypes.STRING(16),
            allowNull: false,
        },
        last_connexion: {
            type: DataTypes.DATE,
            allowNull: false,
        },
    },
    {
        sequelize,
        modelName: "MUser",
        tableName: "user",
    },
);

export default MUser;
