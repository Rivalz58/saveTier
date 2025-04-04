import { FastifyReply, FastifyRequest } from "fastify";
import { ImageService } from "../services/imageService.js";
import {
    InputImage,
    PartialImage,
    SInputImage,
    SPartialImage,
} from "../schemas/imageSchemas.js";
import { MultipartFile } from "@fastify/multipart";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const imageService = new ImageService();

export async function getAllImages(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await imageService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Images have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllImagesToAlbum(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
            throw new BadRequestError("Invalid Album ID");
        }
        const result = await imageService.findAllToAlbumId(albumId);

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
    const imageId = parseInt(req.params.id);
    if (isNaN(imageId)) {
        throw new BadRequestError("Invalid Image ID");
    }
    const result = await imageService.findById(imageId);

    return rep.status(200).send({
        status: "success",
        message: "Image has been found",
        data: result,
    });
}

export async function addImage(req: FastifyRequest, rep: FastifyReply) {
    try {
        const parts = req.parts();
        let fileBuffer: Buffer | null = null;
        let fileData: MultipartFile | null = null;
        const formData: Record<string, any> = {};

        for await (const part of parts) {
            if (part.type === "file") {
                fileData = part;
                fileBuffer = await part.toBuffer();
            } else {
                formData[part.fieldname] = part.value;
            }
        }

        if (!fileBuffer || !fileData) {
            throw new BadRequestError("No image file provided");
        }

        const data: InputImage = SInputImage.parse({
            name: formData.name,
            description: formData.description,
            url: formData.url,
            id_album: parseInt(formData.id_album),
            file: fileBuffer,
        });

        const result = await imageService.create(data, fileData);

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
        const data: PartialImage = SPartialImage.parse(req.body);

        const imageId = parseInt(req.params.id);
        if (isNaN(imageId)) {
            throw new BadRequestError("Invalid Image ID");
        }
        const result = await imageService.updateById(imageId, data);

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
        const imageId = parseInt(req.params.id);
        if (isNaN(imageId)) {
            throw new BadRequestError("Invalid Image ID");
        }
        await imageService.deleteById(imageId);

        return rep
            .status(200)
            .send({ status: "success", message: "Image has been deleted" });
    } catch (error) {
        return handleError(error, rep);
    }
}
