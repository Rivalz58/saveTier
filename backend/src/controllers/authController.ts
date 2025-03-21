import { FastifyReply, FastifyRequest } from "fastify";
import {
    InputAuth,
    InputAuthPassword,
    InputRegistration,
    PartialAuth,
    SInputAuth,
    SInputAuthPassword,
    SInputRegistration,
    SPartialAuth,
} from "../schemas/authSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { AuthService } from "../services/authService.js";
import { AuthorizationError, BadRequestError } from "../errors/AppError.js";
import { UserService } from "../services/userService.js";

const authService = new AuthService();
const userService = new UserService();

export async function login(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputAuth = SInputAuth.parse(req.body);
        const token = await authService.auth(data);

        return rep.status(200).send({
            status: "success",
            message: "User authenticated",
            token,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function revocation(req: FastifyRequest, rep: FastifyReply) {
    try {
        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AuthorizationError(
                "Missing or invalid authorization header",
            );
        }

        // Remove "Bearer "
        const token = authHeader.slice(7);

        if (!token) {
            throw new BadRequestError("Invalid request");
        }

        await authService.revocation(token);

        return rep.status(200).send({
            status: "success",
            message: "Revoke token successful",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function register(req: FastifyRequest, rep: FastifyReply) {
    try {
        const user: InputRegistration = SInputRegistration.parse(req.body);
        const result = await authService.create(user);
        await authService.addUserRole(result.id);

        return rep.status(201).send({
            status: "success",
            message: "User has been created",
            user: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function getCurrentUser(req: FastifyRequest, rep: FastifyReply) {
    try {
        const userId = parseInt(req.user.id);
        if (isNaN(userId)) {
            throw new BadRequestError("Invalid User ID");
        }
        const result = await userService.findById(userId);

        return rep.status(200).send({
            status: "success",
            message: "User has been found",
            user: result,
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateCurrentUser(
    req: FastifyRequest,
    rep: FastifyReply,
) {
    try {
        const data: PartialAuth = SPartialAuth.parse(req.body);

        const userId = parseInt(req.user.id);
        if (isNaN(userId)) {
            throw new BadRequestError("Invalid User ID");
        }
        const result = await userService.updateById(userId, data);

        return rep.status(200).send({
            status: "success",
            message: "User has been updated",
            data: result.toSafeJSON(),
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function updateCurrentUserPassword(
    req: FastifyRequest,
    rep: FastifyReply,
) {
    try {
        const data: InputAuthPassword = SInputAuthPassword.parse(req.body);

        const authHeader = req.headers.authorization;

        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            throw new AuthorizationError(
                "Missing or invalid authorization header",
            );
        }

        // Remove "Bearer "
        const token = authHeader.slice(7);

        const userId = parseInt(req.user.id);
        if (isNaN(userId)) {
            throw new BadRequestError("Invalid User ID");
        }
        await authService.updatePassword(userId, data);
        await authService.revocation(token);
        return rep.status(200).send({
            status: "success",
            message: "Password has been update",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}
