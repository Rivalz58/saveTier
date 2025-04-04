import { FastifyReply, FastifyRequest } from "fastify";
import { TournamentService } from "../services/tournamentService.js";
import {
    InputTournament,
    PartialTournament,
    SInputTournament,
    SPartialTournament,
} from "../schemas/tournamentSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const tournamentService = new TournamentService();

export async function getAllTournaments(
    req: FastifyRequest,
    rep: FastifyReply,
) {
    try {
        const result = await tournamentService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Tournaments have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllTournamentsToAlbum(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
            throw new BadRequestError("Invalid Album ID");
        }
        const result = await tournamentService.findAllToAlbumId(albumId);

        return rep.status(200).send({
            status: "success",
            message: "Tournaments have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllTournamentsToUser(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        let result;

        if (req.params.param.startsWith("@")) {
            result = await tournamentService.findAllToUserNametag(
                req.params.param.slice(1),
            );
        } else {
            const userId = parseInt(req.params.param);
            if (isNaN(userId)) {
                throw new BadRequestError("Invalid User ID");
            }
            result = await tournamentService.findAllToUserId(userId);
        }

        return rep.status(200).send({
            status: "success",
            message: "Tournaments have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getTournament(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    const tournamentId = parseInt(req.params.id);
    if (isNaN(tournamentId)) {
        throw new BadRequestError("Invalid Tournament ID");
    }
    const result = await tournamentService.findById(tournamentId);

    return rep.status(200).send({
        status: "success",
        message: "Tournament has been found",
        data: result,
    });
}

export async function addTournament(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputTournament = SInputTournament.parse(req.body);

        const userId = parseInt(req.user.id);
        if (isNaN(userId)) {
            throw new BadRequestError("Invalid User ID");
        }
        const result = await tournamentService.create(data, userId);

        return rep.status(201).send({
            status: "success",
            message: "Tournament has been created",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateTournament(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const data: PartialTournament = SPartialTournament.parse(req.body);

        const tournamentId = parseInt(req.params.id);
        if (isNaN(tournamentId)) {
            throw new BadRequestError("Invalid Tournament ID");
        }
        const result = await tournamentService.updateById(tournamentId, data);

        return rep.status(200).send({
            status: "success",
            message: "Tournament has been updated",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteTournament(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const tournamentId = parseInt(req.params.id);
        if (isNaN(tournamentId)) {
            throw new BadRequestError("Invalid Tournament ID");
        }
        await tournamentService.deleteById(tournamentId);

        return rep.status(200).send({
            status: "success",
            message: "Tournament has been deleted",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}
