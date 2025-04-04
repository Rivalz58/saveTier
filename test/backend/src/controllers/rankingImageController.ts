import { FastifyReply, FastifyRequest } from "fastify";
import { RankingImageService } from "../services/rankingImageService.js";
import {
    InputRankingImage,
    PartialRankingImage,
    SInputRankingImage,
    SPartialRankingImage,
} from "../schemas/rankingImageSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const rankingImageService = new RankingImageService();

export async function getAllImages(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await rankingImageService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Images have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllImagesToRanking(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const rankingImageId = parseInt(req.params.id);
        if (isNaN(rankingImageId)) {
            throw new BadRequestError("Invalid Ranking ID");
        }
        const result =
            await rankingImageService.findAllToRankingId(rankingImageId);

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
    const rankingImageId = parseInt(req.params.id);
    if (isNaN(rankingImageId)) {
        throw new BadRequestError("Invalid image ID");
    }
    const result = await rankingImageService.findById(rankingImageId);

    return rep.status(200).send({
        status: "success",
        message: "Image has been found",
        data: result,
    });
}

export async function addImage(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputRankingImage = SInputRankingImage.parse(req.body);
        const result = await rankingImageService.create(data);

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
        const data: PartialRankingImage = SPartialRankingImage.parse(req.body);

        const rankingImageId = parseInt(req.params.id);
        if (isNaN(rankingImageId)) {
            throw new BadRequestError("Invalid Image ID");
        }
        const result = await rankingImageService.updateById(
            rankingImageId,
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
        const rankingImageId = parseInt(req.params.id);
        if (isNaN(rankingImageId)) {
            throw new BadRequestError("Invalid Image ID");
        }
        await rankingImageService.deleteById(rankingImageId);

        return rep
            .status(200)
            .send({ status: "success", message: "Image has been deleted" });
    } catch (error) {
        return handleError(error, rep);
    }
}
