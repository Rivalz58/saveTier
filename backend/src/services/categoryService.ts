import MCategory from "../models/categoryModel.js";
import { InputCategory, PartialCategory } from "../schemas/categorySchemas.js";
import { NotFoundError } from "../errors/AppError.js";
import MPossessCategory from "../models/possessCategoryModel.js";
import MAlbum from "../models/albumModel.js";

export class CategoryService {
    async findAll() {
        const categories = await MCategory.findAll({
            include: [
                {
                    model: MAlbum,
                    as: "albums",
                    through: { attributes: [] },
                    attributes: { exclude: ["id_user"] },
                },
            ],
        });
        if (!categories.length) {
            throw new NotFoundError("No categories found");
        }
        return categories;
    }

    async findAllAlbumCategories(albumId: number) {
        const albumExists = await MAlbum.findByPk(albumId);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${albumId} not found`);
        }

        const categoriesId = await MPossessCategory.findAll({
            where: { id_album: albumId },
            attributes: ["id_category"],
        });
        if (!categoriesId.length) {
            throw new NotFoundError(
                `No categories found for album with ID ${albumId}`,
            );
        }

        const categories: MCategory[] = [];
        for (const categoryId of categoriesId) {
            const result = await MCategory.findByPk(
                categoryId.dataValues.id_category,
            );
            if (!result) {
                throw new NotFoundError(
                    `Category with ID ${categoryId.dataValues.id_category} not found`,
                );
            }
            categories.push(result);
        }

        return categories;
    }

    async findById(id: number) {
        const category = await MCategory.findByPk(id, {
            include: [
                {
                    model: MAlbum,
                    as: "albums",
                    through: { attributes: [] },
                    attributes: { exclude: ["id_user"] },
                },
            ],
        });
        if (!category) {
            throw new NotFoundError(`Category with ID ${id} not found`);
        }
        return category;
    }

    async findByName(name: string) {
        const category = await MCategory.findOne({
            where: { name: name },
            include: [
                {
                    model: MAlbum,
                    as: "albums",
                    through: { attributes: [] },
                    attributes: { exclude: ["id_user"] },
                },
            ],
        });
        if (!category) {
            throw new NotFoundError(`Category with Name ${name} not found`);
        }
        return category;
    }

    async create(data: InputCategory) {
        return MCategory.create(data);
    }

    async assignAlbumToCategoryName(albumId: number, categoryName: string) {
        const categoryExists = await this.findByName(categoryName);
        if (!categoryExists) {
            throw new NotFoundError(
                `Category with Name ${categoryName} not found`,
            );
        }

        const albumExists = await MAlbum.findByPk(albumId);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${albumId} not found`);
        }

        return await MPossessCategory.create({
            id_album: albumId,
            id_category: categoryExists.id,
        });
    }

    async updateById(id: number, data: PartialCategory) {
        const category = await MCategory.findByPk(id);
        if (!category) {
            throw new NotFoundError(`Category with ID ${id} not found`);
        }
        return category.update(data);
    }

    async updateByName(name: string, data: PartialCategory) {
        const category = await MCategory.findOne({
            where: { name: name },
        });

        if (!category) {
            throw new NotFoundError(`Category with Name ${name} not found`);
        }
        return category.update(data);
    }

    async deleteById(id: number) {
        const category = await MCategory.findByPk(id);
        if (!category) {
            throw new NotFoundError(`Category with ID ${id} not found`);
        }
        return category.destroy();
    }

    async deleteByName(name: string) {
        const category = await MCategory.findOne({
            where: { name: name },
        });

        if (!category) {
            throw new NotFoundError(`Category with Name ${name} not found`);
        }
        return category.destroy();
    }

    async deleteAlbumCategoryName(albumId: number, categoryName: string) {
        const categoryExists = await this.findByName(categoryName);
        if (!categoryExists) {
            throw new NotFoundError(
                `Category with Name ${categoryName} not found`,
            );
        }

        const albumExists = await MAlbum.findByPk(albumId);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${albumId} not found`);
        }

        const albumCategory = await MPossessCategory.findOne({
            where: { id_category: categoryExists.id, id_album: albumId },
        });
        if (!albumCategory) {
            throw new NotFoundError(
                `No association found between album ID ${albumId} and category Name ${categoryName}`,
            );
        }

        return await albumCategory.destroy();
    }
}
