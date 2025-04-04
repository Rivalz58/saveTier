import { FastifyInstance } from "fastify";
import * as albumController from "../controllers/albumController.js";
import * as albumSchemas from "../schemas/albumSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function albumRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/album",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: z.array(albumSchemas.SOutputAlbum),
                    }),
                },
            },
        },
        albumController.getAllAlbums,
    );

    // fastify.get(
    //     "/user/:param/album",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: albumSchemas.SOutputAlbum,
    //                 }),
    //             },
    //         },
    //     },
    //     albumController.getAllAlbumsToUser,
    // );

    fastify.get(
        "/album/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: albumSchemas.SOutputAlbum,
                    }),
                },
            },
        },
        albumController.getAlbum,
    );

    fastify.post(
        "/album",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: albumSchemas.SOutputAlbum,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        albumController.addAlbum,
    );

    fastify.put(
        "/album/:id",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: albumSchemas.SOutputAlbum,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["User"])],
        },
        albumController.updateAlbum,
    );

    fastify.delete(
        "/album/:id",
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
        albumController.deleteAlbum,
    );
}
