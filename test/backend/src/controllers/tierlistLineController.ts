import { FastifyReply, FastifyRequest } from "fastify";
import { TierlistLineService } from "../services/tierlistLineService.js";
import {
    InputTierlistLine,
    PartialTierlistLine,
    SInputTierlistLine,
    SPartialTierlistLine,
} from "../schemas/tierlistLineSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const tierlistLineService = new TierlistLineService();

export async function getAllLines(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await tierlistLineService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Lines have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllLinesToTierlist(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const tierlistId = parseInt(req.params.id);
        if (isNaN(tierlistId)) {
            throw new BadRequestError("Invalid Tierlist ID");
        }
        const result =
            await tierlistLineService.findAllToTierlistId(tierlistId);

        return rep.status(200).send({
            status: "success",
            message: "Lines have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getLine(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    const tierlistLineId = parseInt(req.params.id);
    if (isNaN(tierlistLineId)) {
        throw new BadRequestError("Invalid Line ID");
    }
    const result = await tierlistLineService.findById(tierlistLineId);

    return rep.status(200).send({
        status: "success",
        message: "Line has been found",
        data: result,
    });
}

export async function addLine(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputTierlistLine = SInputTierlistLine.parse(req.body);
        const result = await tierlistLineService.create(data);

        return rep.status(201).send({
            status: "success",
            message: "Line has been created",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateLine(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const data: PartialTierlistLine = SPartialTierlistLine.parse(req.body);

        const tierlistLineId = parseInt(req.params.id);
        if (isNaN(tierlistLineId)) {
            throw new BadRequestError("Invalid Line ID");
        }
        const result = await tierlistLineService.updateById(
            tierlistLineId,
            data,
        );

        return rep.status(200).send({
            status: "success",
            message: "Line has been updated",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteLine(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const tierlistLineId = parseInt(req.params.id);
        if (isNaN(tierlistLineId)) {
            throw new BadRequestError("Invalid Line ID");
        }
        await tierlistLineService.deleteById(tierlistLineId);

        return rep
            .status(200)
            .send({ status: "success", message: "Line has been deleted" });
    } catch (error) {
        return handleError(error, rep);
    }
}
