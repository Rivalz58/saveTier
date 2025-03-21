import { BadRequestError, NotFoundError } from "../errors/AppError.js";
import MTournamentImage from "../models/tournamentImageModel.js";
import MTournamentOponent from "../models/tournamentOponentModel.js";
import { InputTournamentOponent } from "../schemas/tournamentOponentSchemas.js";

export class TournamentOponentService {
    async findAll() {
        const tournamentOponents = await MTournamentOponent.findAll();
        if (!tournamentOponents.length) {
            throw new NotFoundError("No oponents found");
        }
        return tournamentOponents;
    }

    async findAllToTournamentImageId(tournamentImageId: number) {
        const tournamentImageExists =
            await MTournamentImage.findByPk(tournamentImageId);
        if (!tournamentImageExists) {
            throw new NotFoundError(
                `Images with ID ${tournamentImageId} not found`,
            );
        }

        const tournamentOponents = await MTournamentOponent.findAll({
            where: { id_tournament_image: tournamentImageId },
        });

        if (!tournamentOponents.length) {
            throw new NotFoundError(
                `No oponents found for image with ID ${tournamentImageId}`,
            );
        }

        return tournamentOponents;
    }

    async findById(id: number) {
        const tournamentOponent = await MTournamentOponent.findByPk(id);
        if (!tournamentOponent) {
            throw new NotFoundError(`Oponent with ID ${id} not found`);
        }
        return tournamentOponent;
    }

    async create(data: InputTournamentOponent) {
        if (data.id_oponent === data.id_tournament_image) {
            throw new BadRequestError(`Oponent and image have the same ID`);
        }

        const oponentExists = await MTournamentImage.findByPk(data.id_oponent);
        if (!oponentExists) {
            throw new NotFoundError(
                `Images with ID ${data.id_oponent} not found`,
            );
        }

        const tournamentImageExists = await MTournamentImage.findByPk(
            data.id_tournament_image,
        );
        if (!tournamentImageExists) {
            throw new NotFoundError(
                `Images with ID ${data.id_tournament_image} not found`,
            );
        }

        return MTournamentOponent.create(data);
    }

    async updateById(oponentId: number, tournamentImageId: number) {
        const tournamentOponent = await MTournamentOponent.findByPk(oponentId);
        if (!tournamentOponent) {
            throw new NotFoundError(`Oponent with ID ${oponentId} not found`);
        }

        const tournamentImageExists =
            await MTournamentImage.findByPk(tournamentImageId);
        if (!tournamentImageExists) {
            throw new NotFoundError(
                `Images with ID ${tournamentImageId} not found`,
            );
        }

        const { id_tournament_image } = tournamentOponent;
        if (tournamentImageId === id_tournament_image) {
            throw new BadRequestError(`Oponent and image have the same ID`);
        }

        return tournamentOponent.update({ id_oponent: tournamentImageId });
    }

    async deleteById(id: number) {
        const tournamentOponent = await MTournamentOponent.findByPk(id);
        if (!tournamentOponent) {
            throw new NotFoundError(`Oponent with ID ${id} not found`);
        }

        return tournamentOponent.destroy();
    }
}
