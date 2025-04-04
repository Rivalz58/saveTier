import { FastifyInstance } from "fastify";
import * as tierlistController from "../controllers/tierlistController.js";
import * as tierlistSchemas from "../schemas/tierlistSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function tierlistRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/tierlist",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: z.array(tierlistSchemas.SOutputTierlist),
                    }),
                },
            },
        },
        tierlistController.getAllTierlists,
    );

    // fastify.get(
    //     "/user/:param/tierlist",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(tierlistSchemas.SOutputTierlist),
    //                 }),
    //             },
    //         },
    //     },
    //     tierlistController.getAllTierlistsToUser,
    // );

    // fastify.get(
    //     "/album/:id/tierlist",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(tierlistSchemas.SOutputTierlist),
    //                 }),
    //             },
    //         },
    //     },
    //     tierlistController.getAllTierlistsToAlbum,
    // );

    fastify.get(
        "/tierlist/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tierlistSchemas.SOutputTierlist,
                    }),
                },
            },
        },
        tierlistController.getTierlist,
    );

    fastify.post(
        "/tierlist",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tierlistSchemas.SOutputTierlist,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tierlistController.addTierlist,
    );

    fastify.put(
        "/tierlist/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tierlistSchemas.SOutputTierlist,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tierlistController.updateTierlist,
    );

    fastify.delete(
        "/tierlist/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tierlistController.deleteTierlist,
    );
}
