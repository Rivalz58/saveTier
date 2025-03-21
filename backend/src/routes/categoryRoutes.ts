import { FastifyInstance } from "fastify";
import * as categoryController from "../controllers/categoryController.js";
import * as categorySchemas from "../schemas/categorySchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function categoryRoutes(fastify: FastifyInstance) {
    fastify.get("/category", categoryController.getAllCategories);
    // fastify.get(
    //     "/album/:id/category",
    //     categoryController.getAllAlbumCategories,
    // );
    fastify.get("/category/:param", categoryController.getCategory);

    fastify.post(
        "/category",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: categorySchemas.SOutputCategory,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        categoryController.addCategory,
    );

    fastify.post(
        "/album/:param/category",
        {
            schema: {
                response: {
                    201: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: categorySchemas.SOutputCategory,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        categoryController.addAlbumCategory,
    );

    fastify.put(
        "/category/:param",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: categorySchemas.SOutputCategory,
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        categoryController.updateCategory,
    );

    fastify.delete(
        "/category/:param",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        categoryController.deleteCategory,
    );

    fastify.delete(
        "/album/:param/category",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                    }),
                },
            },
            onRequest: [isAuthenticate, isAllowed(["Admin"])],
        },
        categoryController.deleteAlbumCategory,
    );
}
