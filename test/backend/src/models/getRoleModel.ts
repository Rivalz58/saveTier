import { Model } from "sequelize";
import sequelize from "../config/database.js";
import MUser from "./userModel.js";
import MRole from "./roleModel.js";

class MGetRole extends Model {}

MGetRole.init(
    {},
    {
        sequelize,
        modelName: "MGetRole",
        tableName: "get_role",
        timestamps: false,
    },
);

MUser.belongsToMany(MRole, {
    through: MGetRole,
    foreignKey: "id_user",
    as: "roles",
});

MRole.belongsToMany(MUser, {
    through: MGetRole,
    foreignKey: "id_role",
    as: "users",
});

export default MGetRole;
