import { FastifyReply, FastifyRequest } from "fastify";
import {
    InputAuth,
    InputAuthPassword,
    InputForgotPassword,
    InputRegistration,
    InputResetPassword,
    PartialAuth,
    SInputAuth,
    SInputAuthPassword,
    SInputForgotPassword,
    SInputRegistration,
    SInputResetPassword,
    SPartialAuth,
} from "../schemas/authSchemas.js";
import { handleError } from "../errors/errorHandler.js";
import { AuthService } from "../services/authService.js";
import {
    AuthorizationError,
    BadRequestError,
    SendingEmailError,
} from "../errors/AppError.js";
import { UserService } from "../services/userService.js";
import { checkEmailDomain } from "../config/checkDnsEmail.js";
import { sendPasswordResetEmail } from "../config/sendEmail.js";

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

        const isValidDomain = await checkEmailDomain(user.email);
        if (!isValidDomain) {
            throw new BadRequestError(
                "The email address is invalid or the domain cannot receive emails",
            );
        }

        const result = await authService.create(user);
        await authService.addUserRole(result.id);

        return rep.status(201).send({
            status: "success",
            message: "User has been created",
            data: result,
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
            data: result,
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
            data: result,
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

export async function forgotPassword(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputForgotPassword = SInputForgotPassword.parse(req.body);

        const email = data.email;
        if (!email) {
            throw new BadRequestError("Missing email in request");
        }

        const isValidDomain = await checkEmailDomain(email);
        if (!isValidDomain) {
            throw new BadRequestError(
                "The email address is invalid or the domain cannot receive emails",
            );
        }

        const user = await userService.findByEmail(email);
        if (!user) {
            throw new BadRequestError("User not found");
        }

        const token = await authService.forgotPassword(user.id);

        const info = await sendPasswordResetEmail(email, token);
        if (!info) {
            throw new SendingEmailError("Failed to send email");
        }

        return rep.status(200).send({
            status: "success",
            message: "Reset password link has been sent",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}

export async function resetPassword(req: FastifyRequest, rep: FastifyReply) {
    try {
        const data: InputResetPassword = SInputResetPassword.parse(req.body);

        const password = data.password;
        const token = data.token;

        if (!password || !token) {
            throw new BadRequestError("Missing token or password in request");
        }

        await authService.resetPassword(password, token);

        return rep.status(200).send({
            status: "success",
            message: "Password has been reset",
        });
    } catch (error) {
        return handleError(error, rep);
    }
}
