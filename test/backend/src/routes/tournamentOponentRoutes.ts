import { FastifyInstance } from "fastify";
import * as tournamentOponentController from "../controllers/tournamentOponentController.js";
import * as tournamentOponentSchemas from "../schemas/tournamentOponentSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function tournamentOponentRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/tournament/image/oponent",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: z.array(
                            tournamentOponentSchemas.SOutputTournamentOponent,
                        ),
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Modo", "Admin"])],
        },
        tournamentOponentController.getAllOponents,
    );

    // fastify.get(
    //     "/tournament/image/:id/oponent",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(
    //                         tournamentOponentSchemas.SOutputTournamentOponent,
    //                     ),
    //                 }),
    //             },
    //         },
    //     },
    //     tournamentOponentController.getAllOponentsToTournamentImage,
    // );

    fastify.get(
        "/tournament/image/oponent/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tournamentOponentSchemas.SOutputTournamentOponent,
                    }),
                },
            },
        },
        tournamentOponentController.getOponent,
    );

    fastify.post(
        "/tournament/image/oponent",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tournamentOponentSchemas.SOutputTournamentOponent,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tournamentOponentController.addOponent,
    );

    fastify.put(
        "/tournament/image/oponent/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tournamentOponentSchemas.SOutputTournamentOponent,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tournamentOponentController.updateOponent,
    );

    fastify.delete(
        "/tournament/image/oponent/:id",
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
        tournamentOponentController.deleteOponent,
    );
}
