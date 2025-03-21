import { NotFoundError } from "../errors/AppError.js";
import MImage from "../models/imageModel.js";
import MRankingImage from "../models/rankingImageModel.js";
import MRanking from "../models/rankingModel.js";
import {
    InputRankingImage,
    PartialRankingImage,
} from "../schemas/rankingImageSchemas.js";

export class RankingImageService {
    async findAll() {
        const rankingImages = await MRankingImage.findAll({
            include: [
                {
                    model: MImage,
                    as: "image",
                    attributes: { exclude: ["id_album"] },
                },
            ],
            attributes: { exclude: ["id_ranking", "id_image"] },
        });
        if (!rankingImages.length) {
            throw new NotFoundError("No images found");
        }
        return rankingImages;
    }

    async findAllToRankingId(rankingId: number) {
        const rankingExists = await MRanking.findByPk(rankingId);
        if (!rankingExists) {
            throw new NotFoundError(`Ranking with ID ${rankingId} not found`);
        }

        const rankingImages = await MRankingImage.findAll({
            where: { id_ranking: rankingId },
            include: [
                {
                    model: MImage,
                    as: "image",
                    attributes: { exclude: ["id_album"] },
                },
            ],
            attributes: { exclude: ["id_ranking", "id_image"] },
        });

        if (!rankingImages.length) {
            throw new NotFoundError(
                `No images found for ranking with ID ${rankingId}`,
            );
        }

        return rankingImages;
    }

    async findById(id: number) {
        const rankingImage = await MRankingImage.findByPk(id, {
            include: [
                {
                    model: MImage,
                    as: "image",
                    attributes: { exclude: ["id_album"] },
                },
            ],
            attributes: { exclude: ["id_ranking", "id_image"] },
        });
        if (!rankingImage) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }
        return rankingImage;
    }

    async create(data: InputRankingImage) {
        const imageExists = await MImage.findByPk(data.id_image);
        if (!imageExists) {
            throw new NotFoundError(`Image with ID ${data.id_image} not found`);
        }

        const rankingExists = await MRanking.findByPk(data.id_ranking);
        if (!rankingExists) {
            throw new NotFoundError(
                `Ranking with ID ${data.id_ranking} not found`,
            );
        }

        return MRankingImage.create(data);
    }

    async updateById(id: number, data: PartialRankingImage) {
        const rankingImage = await MRankingImage.findByPk(id);
        if (!rankingImage) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }

        return rankingImage.update(data);
    }

    async deleteById(id: number) {
        const rankingImage = await MRankingImage.findByPk(id);
        if (!rankingImage) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }

        return rankingImage.destroy();
    }
}
