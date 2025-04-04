import { NotFoundError } from "../errors/AppError.js";
import MImage from "../models/imageModel.js";
import MTierlistLineImage from "../models/tierlistLineImageModel.js";
import MTierlistLine from "../models/tierlistLineModel.js";
import MTierlist from "../models/tierlistModel.js";
import {
    InputTierlistLine,
    PartialTierlistLine,
} from "../schemas/tierlistLineSchemas.js";

export class TierlistLineService {
    async findAll() {
        const tierlistLines = await MTierlistLine.findAll({
            include: [
                {
                    model: MTierlistLineImage,
                    as: "tierlistLineImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                    ],
                    attributes: { exclude: ["id_tierlist_line", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_tierlist"] },
        });
        if (!tierlistLines.length) {
            throw new NotFoundError("No lines found");
        }
        return tierlistLines;
    }

    async findAllToTierlistId(tierlistId: number) {
        const tierlistExists = await MTierlist.findByPk(tierlistId);
        if (!tierlistExists) {
            throw new NotFoundError(`Tierlist with ID ${tierlistId} not found`);
        }

        const tierlistLines = await MTierlistLine.findAll({
            include: [
                {
                    model: MTierlistLineImage,
                    as: "tierlistLineImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                    ],
                    attributes: { exclude: ["id_tierlist_line", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_tierlist"] },
        });

        if (!tierlistLines.length) {
            throw new NotFoundError(
                `No lines found for tierlist with ID ${tierlistId}`,
            );
        }

        return tierlistLines;
    }

    async findById(id: number) {
        const tierlistLine = await MTierlistLine.findByPk(id, {
            include: [
                {
                    model: MTierlistLineImage,
                    as: "tierlistLineImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                    ],
                    attributes: { exclude: ["id_tierlist_line", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_tierlist"] },
        });
        if (!tierlistLine) {
            throw new NotFoundError(`Line with ID ${id} not found`);
        }
        return tierlistLine;
    }

    async create(data: InputTierlistLine) {
        const tierlistExists = await MTierlist.findByPk(data.id_tierlist);
        if (!tierlistExists) {
            throw new NotFoundError(
                `Tierlist with ID ${data.id_tierlist} not found`,
            );
        }
        return MTierlistLine.create(data);
    }

    async updateById(id: number, data: PartialTierlistLine) {
        const tierlistLine = await MTierlistLine.findByPk(id);
        if (!tierlistLine) {
            throw new NotFoundError(`Line with ID ${id} not found`);
        }

        return tierlistLine.update(data);
    }

    async deleteById(id: number) {
        const tierlistLine = await MTierlistLine.findByPk(id);
        if (!tierlistLine) {
            throw new NotFoundError(`Line with ID ${id} not found`);
        }

        return tierlistLine.destroy();
    }
}
