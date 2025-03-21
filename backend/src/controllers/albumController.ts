import { FastifyReply, FastifyRequest } from "fastify";
import { AlbumService } from "../services/albumService.js";
import {
    InputAlbum,
    PartialAlbum,
    SInputAlbum,
    SPartialAlbum,
} from "../schemas/albumSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const albumService = new AlbumService();

export async function getAllAlbums(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await albumService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Albums have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllAlbumsToUser(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        let result;

        if (req.params.param.startsWith("@")) {
            result = await albumService.findAllToUserNametag(
                req.params.param.slice(1),
            );
        } else {
            const userId = parseInt(req.params.param);
            if (isNaN(userId)) {
                throw new BadRequestError("Invalid User ID");
            }
            result = await albumService.findAllToUserId(userId);
        }

        return rep.status(200).send({
            status: "success",
            message: "Albums have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAlbum(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
            throw new BadRequestError("Invalid Album ID");
        }
        const result = await albumService.findById(albumId);

        return rep.status(200).send({
            status: "success",
            message: "Album has been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function addAlbum(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputAlbum = SInputAlbum.parse(req.body);

        const userId = parseInt(req.user.id);
        if (isNaN(userId)) {
            throw new BadRequestError("Invalid User ID");
        }
        const result = await albumService.create(data, userId);

        return rep.status(201).send({
            status: "success",
            message: "Album has been created",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateAlbum(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const data: PartialAlbum = SPartialAlbum.parse(req.body);
        const albumId = parseInt(req.params.id);

        if (isNaN(albumId)) {
            throw new BadRequestError("Invalid Album ID");
        }
        const result = await albumService.updateById(albumId, data);

        return rep.status(200).send({
            status: "success",
            message: "Album has been updated",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteAlbum(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
            throw new BadRequestError("Invalid Album ID");
        }
        await albumService.deleteById(albumId);

        return rep.status(200).send({
            status: "success",
            message: "Album has been deleted",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}
