import MAlbum from "../models/albumModel.js";
import { InputAlbum, PartialAlbum } from "../schemas/albumSchemas.js";
import { NotFoundError } from "../errors/AppError.js";
import MImage from "../models/imageModel.js";
import MUser from "../models/userModel.js";
import MCategory from "../models/categoryModel.js";

export class AlbumService {
    async findAll() {
        const albums = await MAlbum.findAll({
            include: [
                {
                    model: MCategory,
                    as: "categories",
                },
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password"] },
                },
                {
                    model: MImage,
                    as: "image",
                    attributes: { exclude: ["id_album"] },
                },
            ],
            attributes: { exclude: ["id_user"] },
        });
        if (!albums.length) {
            throw new NotFoundError("No albums found");
        }
        return albums;
    }

    async findAllToUserId(id: number) {
        const userExists = await MUser.findByPk(id);
        if (!userExists) {
            throw new NotFoundError(`User with ID ${id} not found`);
        }

        const albums = await MAlbum.findAll({
            include: [
                {
                    model: MCategory,
                    as: "categories",
                },
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password"] },
                },
                {
                    model: MImage,
                    as: "image",
                    attributes: { exclude: ["id_album"] },
                },
            ],
            attributes: { exclude: ["id_user"] },
        });

        if (!albums.length) {
            throw new NotFoundError(`No albums found for user with ID ${id}`);
        }

        return albums;
    }

    async findAllToUserNametag(nametag: string) {
        const userExists = await MUser.findOne({
            where: { nametag: nametag },
            attributes: { exclude: ["password"] },
        });
        if (!userExists) {
            throw new NotFoundError(`User with Nametag ${nametag} not found`);
        }

        const albums = await MAlbum.findAll({
            include: [
                {
                    model: MCategory,
                    as: "categories",
                },
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password"] },
                },
                {
                    model: MImage,
                    as: "image",
                    attributes: { exclude: ["id_album"] },
                },
            ],
            attributes: { exclude: ["id_user"] },
        });

        if (!albums.length) {
            throw new NotFoundError(`No albums found for user ${nametag}`);
        }

        return albums;
    }

    async findById(id: number) {
        const album = await MAlbum.findByPk(id, {
            include: [
                {
                    model: MCategory,
                    as: "categories",
                },
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password"] },
                },
                {
                    model: MImage,
                    as: "image",
                    attributes: { exclude: ["id_album"] },
                },
            ],
            attributes: { exclude: ["id_user"] },
        });
        if (!album) {
            throw new NotFoundError(`Album with ID ${id} not found`);
        }
        return album;
    }

    async create(data: InputAlbum, userId: number) {
        return MAlbum.create({ ...data, id_user: userId });
    }

    async updateById(id: number, data: PartialAlbum) {
        const album = await MAlbum.findByPk(id);
        if (!album) {
            throw new NotFoundError(`Album with ID ${id} not found`);
        }
        return album.update(data);
    }

    async deleteById(id: number) {
        const album = await MAlbum.findByPk(id);
        if (!album) {
            throw new NotFoundError(`Album with ID ${id} not found`);
        }
        return album.destroy();
    }
}
