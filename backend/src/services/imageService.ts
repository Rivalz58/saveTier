import MImage from "../models/imageModel.js";
import { InputImage, PartialImage } from "../schemas/imageSchemas.js";
import { NotFoundError } from "../errors/AppError.js";
import MAlbum from "../models/albumModel.js";

export class ImageService {
    async findAll() {
        const images = await MImage.findAll({
            include: [
                {
                    model: MAlbum,
                    as: "album",
                    attributes: { exclude: ["id_user"] },
                },
            ],
            attributes: { exclude: ["id_album"] },
        });
        if (!images.length) {
            throw new NotFoundError("No images found");
        }
        return images;
    }

    async findAllToAlbumId(id: number) {
        const albumExists = await MAlbum.findByPk(id);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${id} not found`);
        }

        const images = await MImage.findAll({
            where: { id_album: id },
            include: [
                {
                    model: MAlbum,
                    as: "album",
                    attributes: { exclude: ["id_user"] },
                },
            ],
            attributes: { exclude: ["id_album"] },
        });

        if (!images.length) {
            throw new NotFoundError(`No images found for album with ID ${id}`);
        }
        return images;
    }

    async findById(id: number) {
        const image = await MImage.findByPk(id, {
            include: [
                {
                    model: MAlbum,
                    as: "album",
                    attributes: { exclude: ["id_user"] },
                },
            ],
            attributes: { exclude: ["id_album"] },
        });
        if (!image) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }
        return image;
    }

    async create(data: InputImage) {
        const albumExists = await MAlbum.findByPk(data.id_album);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${data.id_album} not found`);
        }
        return MImage.create(data);
    }

    async updateById(id: number, data: PartialImage) {
        const image = await MImage.findByPk(id);
        if (!image) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }
        return image.update(data);
    }

    async deleteById(id: number) {
        const image = await MImage.findByPk(id);
        if (!image) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }
        return image.destroy();
    }
}
