import { FastifyReply, FastifyRequest } from "fastify";
import { UserService } from "../services/userService.js";
import {
    InputUser,
    PartialUser,
    SInputUser,
    SPartialUser,
} from "../schemas/userSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const userService = new UserService();

export async function getAllUsers(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await userService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Users have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getUser(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        let result;

        if (req.params.param.startsWith("@")) {
            result = await userService.findByNametag(req.params.param.slice(1));
        } else {
            const userId = parseInt(req.params.param);
            if (isNaN(userId)) {
                throw new BadRequestError("Invalid User ID");
            }
            result = await userService.findById(userId);
        }

        return rep.status(200).send({
            status: "success",
            message: "User has been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function addUser(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputUser = SInputUser.parse(req.body);
        const result = await userService.create(data);

        return rep.status(201).send({
            status: "success",
            message: "User has been created",
            data: result.toSafeJSON(),
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateUser(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
): Promise<void> {
    try {
        const data: PartialUser = SPartialUser.parse(req.body);
        let result;

        if (req.params.param.startsWith("@")) {
            result = await userService.updateByNametag(
                req.params.param.slice(1),
                data,
            );
        } else {
            const userId = parseInt(req.params.param);
            if (isNaN(userId)) {
                throw new BadRequestError("Invalid User ID");
            }
            result = await userService.updateById(userId, data);
        }

        return rep.status(200).send({
            status: "success",
            message: "User has been updated",
            data: result.toSafeJSON(),
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteUser(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        if (req.params.param.startsWith("@")) {
            await userService.deleteByNametag(req.params.param.slice(1));
        } else {
            const userId = parseInt(req.params.param);
            if (isNaN(userId)) {
                throw new BadRequestError("Invalid User ID");
            }
            await userService.deleteById(userId);
        }

        return rep
            .status(200)
            .send({ status: "success", message: "User has been deleted" });
    } catch (error) {
        return handleError(error, rep);
    }
}
