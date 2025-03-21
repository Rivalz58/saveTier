import { FastifyReply, FastifyRequest } from "fastify";
import { TournamentOponentService } from "../services/tournamentOponentService.js";
import {
    InputTournamentOponent,
    PartialTournamentOponent,
    SInputTournamentOponent,
    SPartialTournamentOponent,
} from "../schemas/tournamentOponentSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const tournamentOponentService = new TournamentOponentService();

export async function getAllOponents(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await tournamentOponentService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Oponents have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllOponentsToTournamentImage(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const tournamentImageId = parseInt(req.params.id);
        if (isNaN(tournamentImageId)) {
            throw new BadRequestError("Invalid Image ID");
        }
        const result =
            await tournamentOponentService.findAllToTournamentImageId(
                tournamentImageId,
            );

        return rep.status(200).send({
            status: "success",
            message: "Oponents have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getOponent(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    const tournamentOponentId = parseInt(req.params.id);
    if (isNaN(tournamentOponentId)) {
        throw new BadRequestError("Invalid Oponent ID");
    }
    const result = await tournamentOponentService.findById(tournamentOponentId);

    return rep.status(200).send({
        status: "success",
        message: "Oponent has been found",
        data: result,
    });
}

export async function addOponent(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputTournamentOponent = SInputTournamentOponent.parse(
            req.body,
        );
        const result = await tournamentOponentService.create(data);

        return rep.status(201).send({
            status: "success",
            message: "Oponent has been created",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateOponent(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const data: PartialTournamentOponent = SPartialTournamentOponent.parse(
            req.body,
        );

        const tournamentOponentId = parseInt(req.params.id);
        if (isNaN(tournamentOponentId) || !data.id_oponent) {
            throw new BadRequestError("Invalid Oponent ID");
        }
        const result = await tournamentOponentService.updateById(
            tournamentOponentId,
            data.id_oponent,
        );

        return rep.status(200).send({
            status: "success",
            message: "Oponent has been updated",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteOponent(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const tournamentOponentId = parseInt(req.params.id);
        if (isNaN(tournamentOponentId)) {
            throw new BadRequestError("Invalid Oponent ID");
        }
        await tournamentOponentService.deleteById(tournamentOponentId);

        return rep.status(200).send({
            status: "success",
            message: "Oponent has been deleted",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}
