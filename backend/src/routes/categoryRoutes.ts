import { FastifyInstance } from "fastify";
import * as categoryController from "../controllers/categoryController.js";
import * as categorySchemas from "../schemas/categorySchemas.js";
import { isAllowed, isAuthenticate } from "../middlewares/auth.js";
import z from "zod";

export async function categoryRoutes(fastify: FastifyInstance) {
    fastify.get(
        "/category",
        {
            schema: {
                response: {
                    200: z.object({
                        status: z.string(),
                        message: z.string(),
                        data: z.array(categorySchemas.SOutputCategory),
                    }),
                },
            },
        },
        categoryController.getAllCategories,
    );

    // fastify.get(
    //     "/album/:id/category",
    //     {
    //         schema: {
    //             response: {
    //                 200: z.object({
    //                     status: z.string(),
    //                     message: z.string(),
    //                     data: z.array(categorySchemas.SOutputCategory),
    //                 }),
    //             },
    //         },
    //     },
    //     categoryController.getAllAlbumCategories,
    // );

    fastify.get(
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
        },
        categoryController.getCategory,
    );

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
            // schema: {
            //     response: {
            //         201: z.object({
            //             status: z.string(),
            //             message: z.string(),
            //             data: categorySchemas.SOutputCategory,
            //         }),
            //     },
            // },
            onRequest: [isAuthenticate, isAllowed(["User"])],
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
