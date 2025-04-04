import { FastifyInstance } from "fastify";
import * as roleController from "../controllers/roleController.js";
import * as roleSchemas from "../schemas/roleSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function roleRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/role",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: z.array(roleSchemas.SOutputRole),
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        roleController.getAllRoles,
    );

    // fastify.get(
    //     "/user/:param/role",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(roleSchemas.SOutputRole),
    //                 }),
    //             },
    //         },
    //         onRequest: [isAuthenticate, isAllowed(["Admin"])],
    //     },
    //     roleController.getAllUserRoles,
    // );

    fastify.get(
        "/role/:param",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: roleSchemas.SOutputRole,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        roleController.getRole,
    );

    fastify.post(
        "/role",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: roleSchemas.SOutputRole,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        roleController.addRole,
    );

    // fastify.post(
    //     "/user/:param/role/:param2",
    //     {
    //         schema: {
    //             response: {
    //                 201: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: roleSchemas.SOutputRole,
    //                 }),
    //             },
    //         },
    //         onRequest: [isAuthenticate, isAllowed(["Admin"])],
    //     },
    //     roleController.addUserRole,
    // );

    fastify.put(
        "/role/:param",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: roleSchemas.SOutputRole,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        roleController.updateRole,
    );

    fastify.delete(
        "/role/:param",
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
        roleController.deleteRole,
    );
    fastify.delete(
        "/user/:param/role/:param2",
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
        roleController.deleteUserRole,
    );
}
