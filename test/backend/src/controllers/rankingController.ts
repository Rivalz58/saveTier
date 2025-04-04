import { FastifyReply, FastifyRequest } from "fastify";
import { RankingService } from "../services/rankingService.js";
import {
    InputRanking,
    PartialRanking,
    SInputRanking,
    SPartialRanking,
} from "../schemas/rankingSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const rankingService = new RankingService();

export async function getAllRankings(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await rankingService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Rankings have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllRankingsToAlbum(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
            throw new BadRequestError("Invalid Album ID");
        }
        const result = await rankingService.findAllToAlbumId(albumId);

        return rep.status(200).send({
            status: "success",
            message: "Rankings have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllRankingsToUser(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        let result;

        if (req.params.param.startsWith("@")) {
            result = await rankingService.findAllToUserNametag(
                req.params.param.slice(1),
            );
        } else {
            const userId = parseInt(req.params.param);
            if (isNaN(userId)) {
                throw new BadRequestError("Invalid User ID");
            }
            result = await rankingService.findAllToUserId(userId);
        }

        return rep.status(200).send({
            status: "success",
            message: "Rankings have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getRanking(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    const rankingId = parseInt(req.params.id);
    if (isNaN(rankingId)) {
        throw new BadRequestError("Invalid Ranking ID");
    }
    const result = await rankingService.findById(rankingId);

    return rep.status(200).send({
        status: "success",
        message: "Ranking has been found",
        data: result,
    });
}

export async function addRanking(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputRanking = SInputRanking.parse(req.body);

        const userId = parseInt(req.user.id);
        if (isNaN(userId)) {
            throw new BadRequestError("Invalid User ID");
        }
        const result = await rankingService.create(data, userId);

        return rep.status(201).send({
            status: "success",
            message: "Ranking has been created",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateRanking(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const data: PartialRanking = SPartialRanking.parse(req.body);

        const rankingId = parseInt(req.params.id);
        if (isNaN(rankingId)) {
            throw new BadRequestError("Invalid Ranking ID");
        }
        const result = await rankingService.updateById(rankingId, data);

        return rep.status(200).send({
            status: "success",
            message: "Ranking has been updated",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteRanking(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const rankingId = parseInt(req.params.id);
        if (isNaN(rankingId)) {
            throw new BadRequestError("Invalid Ranking ID");
        }
        await rankingService.deleteById(rankingId);

        return rep
            .status(200)
            .send({ status: "success", message: "Ranking has been deleted" });
    } catch (error) {
        return handleError(error, rep);
    }
}
