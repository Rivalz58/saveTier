import { FastifyInstance } from "fastify";
import * as userController from "../controllers/userController.js";
import * as userSchemas from "../schemas/userSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function userRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/user",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: z.array(userSchemas.SOutputUser),
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        userController.getAllUsers,
    );

    fastify.get(
        "/user/:param",
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
        },
        userController.getUser,
    );

    fastify.post(
        "/user",
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
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        userController.addUser,
    );

    fastify.put(
        "/user/:param",
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
            onRequest: [isAuthenticate, isAllowed(["Modo", "Admin"])],
        },
        userController.updateUser,
    );

    fastify.delete(
        "/user/:param",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        userController.deleteUser,
    );
}
