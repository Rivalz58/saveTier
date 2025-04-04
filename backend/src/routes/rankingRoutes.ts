import { FastifyInstance } from "fastify";
import * as rankingController from "../controllers/rankingController.js";
import * as rankingSchemas from "../schemas/rankingSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function rankingRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/ranking",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: z.array(rankingSchemas.SOutputRanking),
                    }),
                },
            },
        },
        rankingController.getAllRankings,
    );

    // fastify.get(
    //     "/user/:param/ranking",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(rankingSchemas.SOutputRanking),
    //                 }),
    //             },
    //         },
    //     },
    //     rankingController.getAllRankingsToUser,
    // );

    // fastify.get(
    //     "/album/:id/ranking",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(rankingSchemas.SOutputRanking),
    //                 }),
    //             },
    //         },
    //     },
    //     rankingController.getAllRankingsToAlbum,
    // );

    fastify.get(
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
        },
        rankingController.getRanking,
    );

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
            onRequest: [isAuthenticate, isAllowed(["User"])],
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
