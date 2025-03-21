import { NotFoundError } from "../errors/AppError.js";
import MAlbum from "../models/albumModel.js";
import MImage from "../models/imageModel.js";
import MTournamentImage from "../models/tournamentImageModel.js";
import MTournament from "../models/tournamentModel.js";
import MTournamentOponent from "../models/tournamentOponentModel.js";
import MUser from "../models/userModel.js";
import {
    InputTournament,
    PartialTournament,
} from "../schemas/tournamentSchemas.js";

export class TournamentService {
    async findAll() {
        const tournaments = await MTournament.findAll({
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
                    model: MTournamentImage,
                    as: "tournamentImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                        {
                            model: MTournamentOponent,
                            as: "tournamentOponent",
                            attributes: { exclude: ["id_tournament_image"] },
                        },
                    ],
                    attributes: { exclude: ["id_tournament", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });
        if (!tournaments.length) {
            throw new NotFoundError("No tournaments found");
        }
        return tournaments;
    }

    async findAllToAlbumId(albumId: number) {
        const albumExists = await MAlbum.findByPk(albumId);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${albumId} not found`);
        }

        const tournaments = await MTournament.findAll({
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
                    model: MTournamentImage,
                    as: "tournamentImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                        {
                            model: MTournamentOponent,
                            as: "tournamentOponent",
                            attributes: { exclude: ["id_tournament_image"] },
                        },
                    ],
                    attributes: { exclude: ["id_tournament", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });

        if (!tournaments.length) {
            throw new NotFoundError(
                `No tournaments found for album with ID ${albumId}`,
            );
        }

        return tournaments;
    }

    async findAllToUserId(userId: number) {
        const userExists = await MUser.findByPk(userId);
        if (!userExists) {
            throw new NotFoundError(`User with ID ${userId} not found`);
        }

        const tournaments = await MTournament.findAll({
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
                    model: MTournamentImage,
                    as: "tournamentImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                        {
                            model: MTournamentOponent,
                            as: "tournamentOponent",
                            attributes: { exclude: ["id_tournament_image"] },
                        },
                    ],
                    attributes: { exclude: ["id_tournament", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });

        if (!tournaments.length) {
            throw new NotFoundError(
                `No tournaments found for album with ID ${userId}`,
            );
        }

        return tournaments;
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

        const tournaments = await MTournament.findAll({
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
                    model: MTournamentImage,
                    as: "tournamentImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                        {
                            model: MTournamentOponent,
                            as: "tournamentOponent",
                            attributes: { exclude: ["id_tournament_image"] },
                        },
                    ],
                    attributes: { exclude: ["id_tournament", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });

        if (!tournaments.length) {
            throw new NotFoundError(
                `No tournaments found for album with Nametag ${userNametag}`,
            );
        }

        return tournaments;
    }

    async findById(id: number) {
        const tournament = await MTournament.findByPk(id, {
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
                    model: MTournamentImage,
                    as: "tournamentImage",
                    include: [
                        {
                            model: MImage,
                            as: "image",
                            attributes: { exclude: ["id_album"] },
                        },
                        {
                            model: MTournamentOponent,
                            as: "tournamentOponent",
                            attributes: { exclude: ["id_tournament_image"] },
                        },
                    ],
                    attributes: { exclude: ["id_tournament", "id_image"] },
                },
            ],
            attributes: { exclude: ["id_user", "id_album"] },
        });
        if (!tournament) {
            throw new NotFoundError(`Tournament with ID ${id} not found`);
        }
        return tournament;
    }

    async create(data: InputTournament, userId: number) {
        const albumExists = await MAlbum.findByPk(data.id_album);
        if (!albumExists) {
            throw new NotFoundError(`Album with ID ${data.id_album} not found`);
        }

        return MTournament.create({ ...data, id_user: userId });
    }

    async updateById(id: number, data: PartialTournament) {
        const tournament = await MTournament.findByPk(id);
        if (!tournament) {
            throw new NotFoundError(`Tournament with ID ${id} not found`);
        }

        return tournament.update(data);
    }

    async deleteById(id: number) {
        const tournament = await MTournament.findByPk(id);
        if (!tournament) {
            throw new NotFoundError(`Tournament with ID ${id} not found`);
        }

        return tournament.destroy();
    }
}
