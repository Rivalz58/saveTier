import { FastifyReply, FastifyRequest } from "fastify";
import { TournamentImageService } from "../services/tournamentImageService.js";
import {
    InputTournamentImage,
    PartialTournamentImage,
    SInputTournamentImage,
    SPartialTournamentImage,
} from "../schemas/tournamentImageSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const tournamentImageService = new TournamentImageService();

export async function getAllTournamentImages(
    req: FastifyRequest,
    rep: FastifyReply,
) {
    try {
        const result = await tournamentImageService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Images have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllTournamentImagesToTournament(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const tournamentId = parseInt(req.params.id);
        if (isNaN(tournamentId)) {
            throw new BadRequestError("Invalid Tournament ID");
        }
        const result =
            await tournamentImageService.findAllToTournamentId(tournamentId);

        return rep.status(200).send({
            status: "success",
            message: "Images have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getTournamentImage(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    const tournamentImageId = parseInt(req.params.id);
    if (isNaN(tournamentImageId)) {
        throw new BadRequestError("Invalid Image ID");
    }
    const result = await tournamentImageService.findById(tournamentImageId);

    return rep.status(200).send({
        status: "success",
        message: "Image has been found",
        data: result,
    });
}

export async function addTournamentImage(
    req: FastifyRequest,
    rep: FastifyReply,
) {
    try {
        const data: InputTournamentImage = SInputTournamentImage.parse(
            req.body,
        );
        const result = await tournamentImageService.create(data);

        return rep.status(201).send({
            status: "success",
            message: "Image has been created",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateTournamentImage(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const data: PartialTournamentImage = SPartialTournamentImage.parse(
            req.body,
        );

        const tournamentImageId = parseInt(req.params.id);
        if (isNaN(tournamentImageId)) {
            throw new BadRequestError("Invalid Image ID");
        }
        const result = await tournamentImageService.updateById(
            tournamentImageId,
            data,
        );

        return rep.status(200).send({
            status: "success",
            message: "Image has been updated",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteTournamentImage(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const tournamentImageId = parseInt(req.params.id);
        if (isNaN(tournamentImageId)) {
            throw new BadRequestError("Invalid Image ID");
        }
        await tournamentImageService.deleteById(tournamentImageId);

        return rep.status(200).send({
            status: "success",
            message: "Image has been deleted",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}
