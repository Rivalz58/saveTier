import { FastifyInstance } from "fastify";
import { isAuthenticate } from "../middlewares/auth.js";
import * as authController from "../controllers/authController.js";
import * as userSchemas from "../schemas/userSchemas.js";
import { z } from "zod";

export async function authRoutes(fastify: FastifyInstance) {
    fastify.post(
        "/login",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        token: z.string(),
                    }),
                },
            },
        },
        authController.login,
    );

    fastify.post(
        "/revocation",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                    }),
                },
            },
            onRequest: [isAuthenticate],
        },
        authController.revocation,
    );

    fastify.post(
        "/register",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: userSchemas.SOutputUser,
                    }),
                },
            },
        },
        authController.register,
    );

    fastify.get(
        "/me",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: userSchemas.SOutputUser,
                    }),
                },
            },
            onRequest: [isAuthenticate],
        },
        authController.getCurrentUser,
    );

    fastify.put(
        "/me",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: userSchemas.SOutputUser,
                    }),
                },
            },
            onRequest: [isAuthenticate],
        },
        authController.updateCurrentUser,
    );

    fastify.put(
        "/new-password",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                    }),
                },
            },
            onRequest: [isAuthenticate],
        },
        authController.updateCurrentUserPassword,
    );

    fastify.post(
        "/forgot-password",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                    }),
                },
            },
        },
        authController.forgotPassword,
    );

    fastify.put(
        "/reset-password",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                    }),
                },
            },
        },
        authController.resetPassword,
    );
}
