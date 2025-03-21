import { FastifyReply, FastifyRequest } from "fastify";
import { RoleService } from "../services/roleService.js";
import {
    InputRole,
    PartialRole,
    SInputRole,
    SPartialRole,
} from "../schemas/roleSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { BadRequestError } from "../errors/AppError.js";

const roleService = new RoleService();

export async function getAllRoles(req: FastifyRequest, rep: FastifyReply) {
    try {
        const result = await roleService.findAll();

        return rep.status(200).send({
            status: "success",
            message: "Roles have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getAllUserRoles(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        let result;

        if (isNaN(Number(req.params.param))) {
            result = await roleService.findAllUserRolesNametag(
                req.params.param.slice(1),
            );
        } else {
            const userId = parseInt(req.params.param);
            if (isNaN(userId)) {
                throw new BadRequestError("Invalid User ID");
            }
            result = await roleService.findAllUserRolesId(userId);
        }

        return rep.status(200).send({
            status: "success",
            message: "Roles have been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getRole(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        let result;

        if (isNaN(Number(req.params.param))) {
            result = await roleService.findByLibelle(req.params.param);
        } else {
            const roleId = parseInt(req.params.param);
            if (isNaN(roleId)) {
                throw new BadRequestError("Invalid Role ID");
            }
            result = await roleService.findById(roleId);
        }

        return rep.status(200).send({
            status: "success",
            message: "Role has been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function addRole(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputRole = SInputRole.parse(req.body);
        const result = await roleService.create(data);

        return rep.status(201).send({
            status: "success",
            message: "Role has been created",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function addUserRole(
    req: FastifyRequest<{ Params: { param: string; param2: string } }>,
    rep: FastifyReply,
) {
    try {
        let result;

        if (isNaN(Number(req.params.param))) {
            result = await roleService.assignRoleToUserNametag(
                req.params.param.slice(1),
                req.params.param2,
            );
        } else {
            const userId = parseInt(req.params.param);
            if (isNaN(userId)) {
                throw new BadRequestError("Invalid User ID");
            }
            result = await roleService.assignRoleToUserId(
                userId,
                req.params.param2,
            );
        }

        return rep.status(201).send({
            status: "success",
            message: "Role has been assigned to the user",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateRole(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        const data: PartialRole = SPartialRole.parse(req.body);
        let result;

        if (isNaN(Number(req.params.param))) {
            result = await roleService.updateByLibelle(req.params.param, data);
        } else {
            const roleId = parseInt(req.params.param);
            if (isNaN(roleId)) {
                throw new BadRequestError("Invalid Role ID");
            }
            result = await roleService.updateById(roleId, data);
        }

        return rep.status(200).send({
            status: "success",
            message: "Role has been found",
            data: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteRole(
    req: FastifyRequest<{ Params: { param: string } }>,
    rep: FastifyReply,
) {
    try {
        if (isNaN(Number(req.params.param))) {
            await roleService.deleteByLibelle(req.params.param);
        } else {
            const roleId = parseInt(req.params.param);
            if (isNaN(roleId)) {
                throw new BadRequestError("Invalid Role ID");
            }
            await roleService.deleteById(roleId);
        }

        return rep
            .status(200)
            .send({ status: "success", message: "Role has been deleted" });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function deleteUserRole(
    req: FastifyRequest<{ Params: { param: string; param2: string } }>,
    rep: FastifyReply,
) {
    try {
        if (isNaN(Number(req.params.param))) {
            await roleService.deleteUserRoleNametag(
                req.params.param.slice(1),
                req.params.param2,
            );
        } else {
            const userId = parseInt(req.params.param);
            if (isNaN(userId)) {
                throw new BadRequestError("Invalid User ID");
            }

            await roleService.deleteUserRoleId(userId, req.params.param2);
        }

        return rep.status(200).send({
            status: "success",
            message: "Role has been deleted to the user",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}
