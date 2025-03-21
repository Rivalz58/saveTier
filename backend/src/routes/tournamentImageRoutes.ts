import { FastifyInstance } from "fastify";
import * as tournamentImageController from "../controllers/tournamentImageController.js";
import * as tournamentImageSchemas from "../schemas/tournamentImageSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function tournamentImageRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/tournament/image",
        { onRequest: [isAuthenticate, isAllowed(["Modo", "Admin"])] },
        tournamentImageController.getAllTournamentImages,
    );
    // fastify.get(
    //     "/tournament/:id/image",
    //     tournamentImageController.getAllTournamentImagesToTournament,
    // );
    fastify.get(
        "/tournament/image/:id",
        tournamentImageController.getTournamentImage,
    );

    fastify.post(
        "/tournament/image",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tournamentImageSchemas.SOutputTournamentImage,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])]
        },
        tournamentImageController.addTournamentImage,
    );

    fastify.put(
        "/tournament/image/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tournamentImageSchemas.SOutputTournamentImage,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tournamentImageController.updateTournamentImage,
    );

    fastify.delete(
        "/tournament/image/:id",
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
        tournamentImageController.deleteTournamentImage,
    );
}
