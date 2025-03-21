import { FastifyInstance } from "fastify";
import { isAuthenticate } from "../middlewares/auth.js";
import * as authController from "../controllers/authController.js";

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post("/login", authController.login);

    fastify.post(
        "/revocation",
        { onRequest: [isAuthenticate] },
        authController.revocation,
    );

    fastify.post("/register", authController.register);

    fastify.get(
        "/me",
        { onRequest: [isAuthenticate] },
        authController.getCurrentUser,
    );

    fastify.put(
        "/me",
        { onRequest: [isAuthenticate] },
        authController.updateCurrentUser,
    );

    fastify.put(
        "/new-password",
        { onRequest: [isAuthenticate] },
        authController.updateCurrentUserPassword,
    );
}
