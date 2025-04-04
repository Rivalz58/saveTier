import { FastifyReply, FastifyRequest } from "fastify";
import { CategoryService } from "../services/categoryService.js";
import {
    InputCategory,
    PartialCategory,
    SInputCategory,
    SPartialCategory,
} from "../schemas/categorySchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const categoryService = new CategoryService();

export async function getAllCategories(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await categoryService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Categories have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllAlbumCategories(
    req: FastifyRequest<{ Params: { id: string } }>,
    rep: FastifyReply,
) {
    try {
        const albumId = parseInt(req.params.id);
        if (isNaN(albumId)) {
            throw new BadRequestError("Invalid Album ID");
        }

        const result = await categoryService.findAllAlbumCategories(albumId);

        return rep.status(200).send({
            status: "success",
            message: "Categories have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getCategory(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        let result;

        if (isNaN(Number(req.params.param))) {
            result = await categoryService.findByName(req.params.param);
        } else {
            const categoryId = parseInt(req.params.param);
            if (isNaN(categoryId)) {
                throw new BadRequestError("Invalid Category ID");
            }
            result = await categoryService.findById(categoryId);
        }

        return rep.status(200).send({
            status: "success",
            message: "Category has been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function addCategory(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputCategory = SInputCategory.parse(req.body);
        const result = await categoryService.create(data);

        return rep.status(201).send({
            status: "success",
            message: "Category has been created",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function addAlbumCategory(
    req: FastifyRequest<{
        Params: { param: string };
    }>,
    rep: FastifyReply,
) {
    try {
        const data: InputCategory = SInputCategory.parse(req.body);

        if (!data.name || Number(data.name)) {
            throw new BadRequestError("Invalid Category Name");
        }

        const albumId = parseInt(req.params.param);
        if (isNaN(albumId)) {
            throw new BadRequestError("Invalid Album ID");
        }

        const result = await categoryService.assignAlbumToCategoryName(
            albumId,
            data.name,
        );

        return rep.status(201).send({
            status: "success",
            message: "Category has been assigned to the album",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateCategory(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        const data: PartialCategory = SPartialCategory.parse(req.body);
        let result;

        if (isNaN(Number(req.params.param))) {
            result = await categoryService.updateByName(req.params.param, data);
        } else {
            const categoryId = parseInt(req.params.param);
            if (isNaN(categoryId)) {
                throw new BadRequestError("Invalid Category ID");
            }
            result = await categoryService.updateById(categoryId, data);
        }

        return rep.status(200).send({
            status: "success",
            message: "Category has been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteCategory(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        if (isNaN(Number(req.params.param))) {
            await categoryService.deleteByName(req.params.param);
        } else {
            const categoryId = parseInt(req.params.param);
            if (isNaN(categoryId)) {
                throw new BadRequestError("Invalid Category ID");
            }
            await categoryService.deleteById(categoryId);
        }

        return rep
            .status(200)
            .send({ status: "success", message: "Category has been deleted" });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteAlbumCategory(
    req: FastifyRequest<{
        Params: { param: string };
    }>,
    rep: FastifyReply,
) {
    try {
        const data: InputCategory = SInputCategory.parse(req.body);

        if (!data.name || Number(data.name)) {
            throw new BadRequestError("Invalid Category Name");
        }

        const albumId = parseInt(req.params.param);
        if (isNaN(albumId)) {
            throw new BadRequestError("Invalid Album ID");
        }

        await categoryService.deleteAlbumCategoryName(albumId, data.name);

        return rep.status(200).send({
            status: "success",
            message: "Category has been deleted to the album",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}
