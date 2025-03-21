import { Model } from "sequelize";
import sequelize from "../config/database.js";
import MAlbum from "./albumModel.js";
import MCategory from "./categoryModel.js";

class MPossessCategory extends Model {}

MPossessCategory.init(
    {},
    {
        sequelize,
        modelName: "MPossessCategory",
        tableName: "possess_category",
        timestamps: false,
    },
);

MAlbum.belongsToMany(MCategory, {
    through: MPossessCategory,
    foreignKey: "id_album",
    as: "categories",
});

MCategory.belongsToMany(MAlbum, {
    through: MPossessCategory,
    foreignKey: "id_category",
    as: "albums",
});

export default MPossessCategory;
