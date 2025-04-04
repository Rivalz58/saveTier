import { FastifyInstance } from "fastify";
import * as imageController from "../controllers/imageController.js";
import * as imageSchemas from "../schemas/imageSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function imageRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/image",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: z.array(imageSchemas.SOutputImage),
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Modo", "Admin"])],
        },
        imageController.getAllImages,
    );

    // fastify.get(
    //     "/album/:id/image",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(imageSchemas.SOutputImage),
    //                 }),
    //             },
    //         },
    //     },
    //     imageController.getAllImagesToAlbum,
    // );

    fastify.get(
        "/image/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: imageSchemas.SOutputImage,
                    }),
                },
            },
        },
        imageController.getImage,
    );

    fastify.post(
        "/image",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: imageSchemas.SOutputImage,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        imageController.addImage,
    );

    fastify.put(
        "/image/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: imageSchemas.SOutputImage,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        imageController.updateImage,
    );

    fastify.delete(
        "/image/:id",
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
        imageController.deleteImage,
    );
}
