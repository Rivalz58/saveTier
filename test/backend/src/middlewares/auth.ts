import { FastifyRequest } from "fastify";
import { AuthenticationError, AuthorizationError } from "../errors/AppError.js";
import { verifyToken } from "../config/auth.js";
import MRevocation from "../models/revocationModel.js";

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
            attributes: ["revocation_date"],
        });

        if (revocations.length > 0) {
            // Trier les révocations par date (les plus récentes d'abord)
            const sortedRevocations = [...revocations].sort((a, b) => 
                new Date(b.revocation_date).getTime() - new Date(a.revocation_date).getTime()
            );
            
            // Vérifier si le token a été émis AVANT la dernière révocation
            const tokenIssueTime = new Date((payload.iat as number) * 1000);
            const latestRevocation = new Date(sortedRevocations[0].revocation_date);
            
            if (tokenIssueTime < latestRevocation) {
                throw new AuthenticationError("Token expired");
            }
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