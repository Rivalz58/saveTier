import { FastifyInstance } from "fastify";
import * as tierlistLineController from "../controllers/tierlistLineController.js";
import * as tierlistLineSchemas from "../schemas/tierlistLineSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function tierlistLineRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/tierlist/line",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: z.array(tierlistLineSchemas.SOutputTierlistLine),
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Modo", "Admin"])],
        },
        tierlistLineController.getAllLines,
    );

    // fastify.get(
    //     "/tierlist/:id/line",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(tierlistLineSchemas.SOutputTierlistLine),
    //                 }),
    //             },
    //         },
    //     },
    //     tierlistLineController.getAllLinesToTierlist,
    // );

    fastify.get(
        "/tierlist/line/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tierlistLineSchemas.SOutputTierlistLine,
                    }),
                },
            },
        },
        tierlistLineController.getLine,
    );

    fastify.post(
        "/tierlist/line",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tierlistLineSchemas.SOutputTierlistLine,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tierlistLineController.addLine,
    );

    fastify.put(
        "/tierlist/line/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tierlistLineSchemas.SOutputTierlistLine,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tierlistLineController.updateLine,
    );

    fastify.delete(
        "/tierlist/line/:id",
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
        tierlistLineController.deleteLine,
    );
}
