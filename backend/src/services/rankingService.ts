import { NotFoundError } from "../errors/AppError.js";
import MAlbum from "../models/albumModel.js";
import MImage from "../models/imageModel.js";
import MRankingImage from "../models/rankingImageModel.js";
import MRanking from "../models/rankingModel.js";
import MUser from "../models/userModel.js";
import { InputRanking, PartialRanking } from "../schemas/rankingSchemas.js";

export class RankingService {
    async findAll() {
        const rankings = await MRanking.findAll({
            include: [
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password"] },
                },
                {
                    model: MAlbum,
                    as: "album",
                    include: [
                        {
                            model: MUser,
                            as: "author",
                            attributes: { exclude: ["password"] },
                        },
                    ],
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MRankingImage,
                    as: "rankingImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                    ],
                    attributes: { exclude: ["id_ranking", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });
        if (!rankings.length) {
            throw new NotFoundError("No rankings found");
        }
        return rankings;
    }

    async findAllToAlbumId(albumId: number) {
        const albumExists = await MAlbum.findByPk(albumId);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${albumId} not found`);
        }

        const rankings = await MRanking.findAll({
            where: { id_album: albumId },
            include: [
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password"] },
                },
                {
                    model: MAlbum,
                    as: "album",
                    include: [
                        {
                            model: MUser,
                            as: "author",
                            attributes: { exclude: ["password"] },
                        },
                    ],
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MRankingImage,
                    as: "rankingImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                    ],
                    attributes: { exclude: ["id_ranking", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });

        if (!rankings.length) {
            throw new NotFoundError(
                `No rankings found for album with ID ${albumId}`,
            );
        }

        return rankings;
    }

    async findAllToUserId(userId: number) {
        const userExists = await MUser.findByPk(userId);
        if (!userExists) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        const rankings = await MRanking.findAll({
            where: { id_user: userId },
            include: [
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password"] },
                },
                {
                    model: MAlbum,
                    as: "album",
                    include: [
                        {
                            model: MUser,
                            as: "author",
                            attributes: { exclude: ["password"] },
                        },
                    ],
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MRankingImage,
                    as: "rankingImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                    ],
                    attributes: { exclude: ["id_ranking", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });

        if (!rankings.length) {
            throw new NotFoundError(
                `No rankings found for album with ID ${userId}`,
            );
        }

        return rankings;
    }

    async findAllToUserNametag(userNametag: string) {
        const userExists = await MUser.findOne({
            where: { nametag: userNametag },
            attributes: { exclude: ["password"] },
        });
        if (!userExists) {
            throw new NotFoundError(
                `User with Nametag ${userNametag} not found`,
            );
        }

        const rankings = await MRanking.findAll({
            where: { id_user: userExists.id },
            include: [
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password"] },
                },
                {
                    model: MAlbum,
                    as: "album",
                    include: [
                        {
                            model: MUser,
                            as: "author",
                            attributes: { exclude: ["password"] },
                        },
                    ],
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MRankingImage,
                    as: "rankingImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                    ],
                    attributes: { exclude: ["id_ranking", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });

        if (!rankings.length) {
            throw new NotFoundError(
                `No rankings found for album with Nametag ${userNametag}`,
            );
        }

        return rankings;
    }

    async findById(id: number) {
        const ranking = await MRanking.findByPk(id, {
            include: [
                {
                    model: MUser,
                    as: "author",
                    attributes: { exclude: ["password"] },
                },
                {
                    model: MAlbum,
                    as: "album",
                    include: [
                        {
                            model: MUser,
                            as: "author",
                            attributes: { exclude: ["password"] },
                        },
                    ],
                    attributes: { exclude: ["id_user"] },
                },
                {
                    model: MRankingImage,
                    as: "rankingImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                    ],
                    attributes: { exclude: ["id_ranking", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });
        if (!ranking) {
            throw new NotFoundError(`Ranking with ID ${id} not found`);
        }
        return ranking;
    }

    async create(data: InputRanking, userId: number) {
        const albumExists = await MAlbum.findByPk(data.id_album);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${data.id_album} not found`);
        }

        return MRanking.create({ ...data, id_user: userId });
    }

    async updateById(id: number, data: PartialRanking) {
        const ranking = await MRanking.findByPk(id);
        if (!ranking) {
            throw new NotFoundError(`Ranking with ID ${id} not found`);
        }

        return ranking.update(data);
    }

    async deleteById(id: number) {
        const ranking = await MRanking.findByPk(id);
        if (!ranking) {
            throw new NotFoundError(`Ranking with ID ${id} not found`);
        }

        return ranking.destroy();
    }
}
