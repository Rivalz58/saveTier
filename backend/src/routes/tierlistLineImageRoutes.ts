import { FastifyInstance } from "fastify";
import * as tierlistLineImageController from "../controllers/tierlistLineImageController.js";
import * as tierlistLineImageSchemas from "../schemas/tierlistLineImageSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function tierlistLineImageRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/tierlist/line/image",
        { onRequest: [isAuthenticate, isAllowed(["Modo", "Admin"])] },
        tierlistLineImageController.getAllImages,
    );
    // fastify.get(
    //     "/tierlist/line/:id/image",
    //     tierlistLineImageController.getAllImagesToLine,
    // );
    fastify.get(
        "/tierlist/line/image/:id",
        tierlistLineImageController.getImage,
    );

    fastify.post(
        "/tierlist/line/image",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tierlistLineImageSchemas.SOutputTierlistLineImage,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])]
        },
        tierlistLineImageController.addImage,
    );

    fastify.put(
        "/tierlist/line/image/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: tierlistLineImageSchemas.SOutputTierlistLineImage,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        tierlistLineImageController.updateImage,
    );

    fastify.delete(
        "/tierlist/line/image/:id",
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
        tierlistLineImageController.deleteImage,
    );
}
