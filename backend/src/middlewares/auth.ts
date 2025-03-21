import { FastifyRequest } from "fastify";
import { AuthenticationError, AuthorizationError } from "../errors/AppError.js";
import { verifyToken } from "../config/auth.js";
import MRevocation from "../models/revocationModel.js";
import { UserService } from "../services/userService.js";

const userService = new UserService();

export async function isAuthenticate(
    req: FastifyRequest<{
        Params: { id: string; param: string; param2: string };
    }>,
) {
    try {
        const authorization = req.headers.authorization;

        if (!authorization || !authorization.startsWith("Bearer ")) {
            throw new AuthenticationError(
                "Missing or invalid authorization header",
            );
        }

        // Remove "Bearer "
        const token = authorization.slice(7);

        const payload = await verifyToken(token);
        if (!payload) {
            throw new AuthenticationError("Invalid token payload");
        }

        const revocations = await MRevocation.findAll({
            where: { id_user: payload.id },
            attributes: ["date"],
        });

        if (revocations.length > 0) {
            revocations.forEach((revocation) => {
                const { date } = revocation;
                if (new Date((payload.iat as number) * 1000) < date) {
                    throw new AuthenticationError("Token expired");
                }
            });
        }

        req.user = {
            id: payload.id as string,
            roles: payload.roles as string[],
        };
    } catch (error) {
        if (error instanceof AuthenticationError) {
            throw new AuthenticationError(error.message);
        } else {
            throw new AuthenticationError("Unauthorized, try to connect");
        }
    }
}

export function isAllowed(allowedRoles: string[]) {
    return async (
        req: FastifyRequest<{
            Params: { id: string; param: string; param2: string };
        }>,
    ) => {
        try {
            const user = req.user;

            if (!user || !user.roles) {
                throw new AuthorizationError("User information is missing");
            }

            const hasAccess = user.roles.some((role) =>
                allowedRoles.includes(role),
            );
            if (!hasAccess) {
                throw new AuthorizationError("Access denied");
            }
        } catch (error) {
            if (error instanceof AuthorizationError) {
                throw new AuthorizationError(error.message);
            } else {
                throw new AuthorizationError("Access denied or try to connect");
            }
        }
    };
}
