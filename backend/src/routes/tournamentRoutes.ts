import { FastifyInstance } from "fastify";
import * as tournamentController from "../controllers/tournamentController.js";
import * as tournamentSchemas from "../schemas/tournamentSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function tournamentRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/tournament",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: z.array(tournamentSchemas.SOutputTournament),
                    }),
                },
            },
        },
        tournamentController.getAllTournaments,
    );

    // fastify.get(
    //     "/user/:param/tournament",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(tournamentSchemas.SOutputTournament),
    //                 }),
    //             },
    //         },
    //     },
    //     tournamentController.getAllTournamentsToUser,
    // );

    // fastify.get(
    //     "/album/:id/tournament",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(tournamentSchemas.SOutputTournament),
    //                 }),
    //             },
    //         },
    //     },
    //     tournamentController.getAllTournamentsToAlbum,
    // );

    fastify.get(
        "/tournament/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tournamentSchemas.SOutputTournament,
                    }),
                },
            },
        },
        tournamentController.getTournament,
    );

    fastify.post(
        "/tournament",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tournamentSchemas.SOutputTournament,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tournamentController.addTournament,
    );

    fastify.put(
        "/tournament/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tournamentSchemas.SOutputTournament,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tournamentController.updateTournament,
    );

    fastify.delete(
        "/tournament/:id",
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
        tournamentController.deleteTournament,
    );
}
