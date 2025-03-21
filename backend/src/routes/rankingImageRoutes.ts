import { FastifyInstance } from "fastify";
import * as rankingImageController from "../controllers/rankingImageController.js";
import * as rankingImageSchemas from "../schemas/rankingImageSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function rankingImageRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/ranking/image",
        { onRequest: [isAuthenticate, isAllowed(["Modo", "Admin"])] },
        rankingImageController.getAllImages,
    );
    // fastify.get(
    //     "/ranking/:id/image",
    //     rankingImageController.getAllImagesToRanking,
    // );
    fastify.get("/ranking/image/:id", rankingImageController.getImage);

    fastify.post(
        "/ranking/image",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: rankingImageSchemas.SOutputRankingImage,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])] 
        },
        rankingImageController.addImage,
    );

    fastify.put(
        "/ranking/image/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: rankingImageSchemas.SOutputRankingImage,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        rankingImageController.updateImage,
    );

    fastify.delete(
        "/ranking/image/:id",
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
        rankingImageController.deleteImage,
    );
}
