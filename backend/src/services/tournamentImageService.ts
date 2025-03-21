import { NotFoundError } from "../errors/AppError.js";
import MImage from "../models/imageModel.js";
import MTournamentImage from "../models/tournamentImageModel.js";
import MTournament from "../models/tournamentModel.js";
import MTournamentOponent from "../models/tournamentOponentModel.js";
import {
    InputTournamentImage,
    PartialTournamentImage,
} from "../schemas/tournamentImageSchemas.js";

export class TournamentImageService {
    async findAll() {
        const tournamentImage = await MTournamentImage.findAll({
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
        });
        if (!tournamentImage.length) {
            throw new NotFoundError("No images found");
        }
        return tournamentImage;
    }

    async findAllToTournamentId(tournamentId: number) {
        const tournamentExists = await MTournament.findByPk(tournamentId);
        if (!tournamentExists) {
            throw new NotFoundError(
                `Tournament with ID ${tournamentId} not found`,
            );
        }

        const tournamentImage = await MTournamentImage.findAll({
            where: { id_tournament: tournamentId },
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
        });

        if (!tournamentImage.length) {
            throw new NotFoundError(
                `No images found for tournament with ID ${tournamentId}`,
            );
        }

        return tournamentImage;
    }

    async findById(id: number) {
        const tournamentImage = await MTournamentImage.findByPk(id, {
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
        });
        if (!tournamentImage) {
            throw new NotFoundError(`Images with ID ${id} not found`);
        }
        return tournamentImage;
    }

    async create(data: InputTournamentImage) {
        const imageExists = await MImage.findByPk(data.id_image);
        if (!imageExists) {
            throw new NotFoundError(`Image with ID ${data.id_image} not found`);
        }

        const tournamentExists = await MTournament.findByPk(data.id_tournament);
        if (!tournamentExists) {
            throw new NotFoundError(
                `Tournament with ID ${data.id_tournament} not found`,
            );
        }

        return MTournamentImage.create(data);
    }

    async updateById(id: number, data: PartialTournamentImage) {
        const tournamentImage = await MTournamentImage.findByPk(id);
        if (!tournamentImage) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }

        return tournamentImage.update(data);
    }

    async deleteById(id: number) {
        const tournamentImage = await MTournamentImage.findByPk(id);
        if (!tournamentImage) {
            throw new NotFoundError(`Image with ID ${id} not found`);
        }

        return tournamentImage.destroy();
    }
}
