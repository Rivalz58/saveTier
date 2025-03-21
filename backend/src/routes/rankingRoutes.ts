import { FastifyInstance } from "fastify";
import * as rankingController from "../controllers/rankingController.js";
import * as rankingSchemas from "../schemas/rankingSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function rankingRoutes(fastify: FastifyInstance) {
    fastify.get("/ranking", rankingController.getAllRankings);
    // fastify.get("/user/:param/ranking", rankingController.getAllRankingsToUser);
    // fastify.get("/album/:id/ranking", rankingController.getAllRankingsToAlbum);
    fastify.get("/ranking/:id", rankingController.getRanking);

    fastify.post(
        "/ranking",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: rankingSchemas.SOutputRanking,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])]
        },
        rankingController.addRanking,
    );

    fastify.put(
        "/ranking/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: rankingSchemas.SOutputRanking,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        rankingController.updateRanking,
    );

    fastify.delete(
        "/ranking/:id",
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
        rankingController.deleteRanking,
    );
}
