import { FastifyReply, FastifyRequest } from "fastify";
import { TierlistService } from "../services/tierlistService.js";
import {
    InputTierlist,
    PartialTierlist,
    SInputTierlist,
    SPartialTierlist,
} from "../schemas/tierlistSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const tierlistService = new TierlistService();

export async function getAllTierlists(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await tierlistService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Tierlists have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllTierlistsToAlbum(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
            throw new BadRequestError("Invalid Album ID");
        }
        const result = await tierlistService.findAllToAlbumId(albumId);

        return rep.status(200).send({
            status: "success",
            message: "Tierlists have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllTierlistsToUser(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        let result;

        if (req.params.param.startsWith("@")) {
            result = await tierlistService.findAllToUserNametag(
                req.params.param.slice(1),
            );
        } else {
            const userId = parseInt(req.params.param);
            if (isNaN(userId)) {
                throw new BadRequestError("Invalid User ID");
            }
            result = await tierlistService.findAllToUserId(userId);
        }

        return rep.status(200).send({
            status: "success",
            message: "Tierlists have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getTierlist(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    const tierlistId = parseInt(req.params.id);
    if (isNaN(tierlistId)) {
        throw new BadRequestError("Invalid Tierlist ID");
    }
    const result = await tierlistService.findById(tierlistId);

    return rep.status(200).send({
        status: "success",
        message: "Tierlist has been found",
        data: result,
    });
}

export async function addTierlist(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputTierlist = SInputTierlist.parse(req.body);

        const userId = parseInt(req.user.id);
        if (isNaN(userId)) {
            throw new BadRequestError("Invalid User ID");
        }
        const result = await tierlistService.create(data, userId);

        return rep.status(201).send({
            status: "success",
            message: "Tierlist has been created",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateTierlist(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const data: PartialTierlist = SPartialTierlist.parse(req.body);

        const tierlistId = parseInt(req.params.id);
        if (isNaN(tierlistId)) {
            throw new BadRequestError("Invalid Tierlist ID");
        }
        const result = await tierlistService.updateById(tierlistId, data);

        return rep.status(200).send({
            status: "success",
            message: "Tierlist has been updated",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteTierlist(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const tierlistId = parseInt(req.params.id);
        if (isNaN(tierlistId)) {
            throw new BadRequestError("Invalid Tierlist ID");
        }
        await tierlistService.deleteById(tierlistId);

        return rep
            .status(200)
            .send({ status: "success", message: "Tierlist has been deleted" });
    } catch (error) {
        return handleError(error, rep);
    }
}
