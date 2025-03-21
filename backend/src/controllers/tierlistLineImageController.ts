import { FastifyReply, FastifyRequest } from "fastify";
import { TierlistLineImageService } from "../services/tierlistLineImageService.js";
import {
    InputTierlistLineImage,
    PartialTierlistLineImage,
    SInputTierlistLineImage,
    SPartialTierlistLineImage,
} from "../schemas/tierlistLineImageSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const tierlistLineImageService = new TierlistLineImageService();

export async function getAllImages(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await tierlistLineImageService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Images have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllImagesToLine(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const tierlistLineId = parseInt(req.params.id);
        if (isNaN(tierlistLineId)) {
            throw new BadRequestError("Invalid Line ID");
        }
        const result =
            await tierlistLineImageService.findAllToLineId(tierlistLineId);

        return rep.status(200).send({
            status: "success",
            message: "Images have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getImage(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    const tierlistLineImageId = parseInt(req.params.id);
    if (isNaN(tierlistLineImageId)) {
        throw new BadRequestError("Invalid Image ID");
    }
    const result = await tierlistLineImageService.findById(tierlistLineImageId);

    return rep.status(200).send({
        status: "success",
        message: "Image has been found",
        data: result,
    });
}

export async function addImage(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputTierlistLineImage = SInputTierlistLineImage.parse(
            req.body,
        );
        const result = await tierlistLineImageService.create(data);

        return rep.status(201).send({
            status: "success",
            message: "Image has been created",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateImage(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const data: PartialTierlistLineImage = SPartialTierlistLineImage.parse(
            req.body,
        );

        const tierlistLineImageId = parseInt(req.params.id);
        if (isNaN(tierlistLineImageId)) {
            throw new BadRequestError("Invalid Image ID");
        }
        const result = await tierlistLineImageService.updateById(
            tierlistLineImageId,
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

export async function deleteImage(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const tierlistLineImageId = parseInt(req.params.id);
        if (isNaN(tierlistLineImageId)) {
            throw new BadRequestError("Invalid Image ID");
        }
        await tierlistLineImageService.deleteById(tierlistLineImageId);

        return rep.status(200).send({
            status: "success",
            message: "Image has been deleted",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}
