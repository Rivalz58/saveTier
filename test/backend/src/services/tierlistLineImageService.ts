import { NotFoundError } from "../errors/AppError.js";
import MImage from "../models/imageModel.js";
import MTierlistLineImage from "../models/tierlistLineImageModel.js";
import MTierlistLine from "../models/tierlistLineModel.js";
import {
    InputTierlistLineImage,
    PartialTierlistLineImage,
} from "../schemas/tierlistLineImageSchemas.js";

export class TierlistLineImageService {
    async findAll() {
        const tierlistLineImages = await MTierlistLineImage.findAll({
            include: [
                {
                    model: MImage,
                    as: "image",
                    attributes: { exclude: ["id_album"] },
                },
            ],
            attributes: { exclude: ["id_tierlist_line", "id_image"] },
        });
        if (!tierlistLineImages.length) {
            throw new NotFoundError("No images found");
        }
        return tierlistLineImages;
    }

    async findAllToLineId(tierlistLineId: number) {
        const tierlistLineExists = await MTierlistLine.findByPk(tierlistLineId);
        if (!tierlistLineExists) {
            throw new NotFoundError(`Line with ID ${tierlistLineId} not found`);
        }

        const tierlistLineImages = await MTierlistLineImage.findAll({
            include: [
                {
                    model: MImage,
                    as: "image",
                    attributes: { exclude: ["id_album"] },
                },
            ],
            attributes: { exclude: ["id_tierlist_line", "id_image"] },
        });

        if (!tierlistLineImages.length) {
            throw new NotFoundError(
                `No images found for line with ID ${tierlistLineId}`,
            );
        }

        return tierlistLineImages;
    }

    async findById(id: number) {
        const tierlistLineImage = await MTierlistLineImage.findByPk(id, {
            include: [
                {
                    model: MImage,
                    as: "image",
                    attributes: { exclude: ["id_album"] },
                },
            ],
            attributes: { exclude: ["id_tierlist_line", "id_image"] },
        });
        if (!tierlistLineImage) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }
        return tierlistLineImage;
    }

    async create(data: InputTierlistLineImage) {
        const imageExists = await MImage.findByPk(data.id_image);
        if (!imageExists) {
            throw new NotFoundError(`Image with ID ${data.id_image} not found`);
        }

        const tierlistLineExists = await MTierlistLine.findByPk(
            data.id_tierlist_line,
        );
        if (!tierlistLineExists) {
            throw new NotFoundError(
                `Line with ID ${data.id_tierlist_line} not found`,
            );
        }
        if (!tierlistLineExists) {
            throw new NotFoundError(
                `Line with ID ${data.id_tierlist_line} not found`,
            );
        }

        return MTierlistLineImage.create(data);
    }

    async updateById(id: number, data: PartialTierlistLineImage) {
        const tierlistLineImage = await MTierlistLineImage.findByPk(id);
        if (!tierlistLineImage) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }

        return tierlistLineImage.update(data);
    }

    async deleteById(id: number) {
        const tierlistLineImage = await MTierlistLineImage.findByPk(id);
        if (!tierlistLineImage) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }

        return tierlistLineImage.destroy();
    }
}
