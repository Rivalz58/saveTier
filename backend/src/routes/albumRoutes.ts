import { FastifyInstance } from "fastify";
import * as albumController from "../controllers/albumController.js";
import * as albumSchemas from "../schemas/albumSchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function albumRoutes(fastify: FastifyInstance) {
    fastify.get("/album", albumController.getAllAlbums);
    // fastify.get("/user/:param/album", albumController.getAllAlbumsToUser);
    fastify.get("/album/:id", albumController.getAlbum);

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
