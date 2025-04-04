import z from "zod";
import { SOutputAlbum } from "./albumSchemas.js";

export const SImageCore = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters long")
        .max(32, "Name must be at most 32 characters long"),
    description: z
        .string()
        .max(512, "Description must be a maximum 512 characters")
        .optional(),
    url: z
        .string()
        .url("Invalid URL format")
        .max(1024, "Url must be a maximum 1024 characters")
        .optional(),
});

export const SInputImage = SImageCore.extend({
    file: z.instanceof(Buffer),
    id_album: z.number().positive(),
});

export const SPartialImage = SImageCore.partial();

export const SOutputImage: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        name: z
            .string()
            .min(2, "Name must be at least 2 characters long")
            .max(32, "Name must be at most 32 characters long"),
        description: z
            .string()
            .max(512, "Description must be a maximum 512 characters")
            .optional()
            .nullable(),
        url: z
            .string()
            .url("Invalid URL format")
            .max(1024, "Url must be a maximum 1024 characters")
            .optional()
            .nullable(),
        path_image: z
            .string()
            .url("Invalid path image")
            .max(1024, "Url must be a maximum 1024 characters"),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        albums: z.array(SOutputAlbum).optional(),
    }),
);

export type PartialImage = z.infer<typeof SPartialImage>;
export type InputImage = z.infer<typeof SInputImage>;
export type OutputImage = z.infer<typeof SOutputImage>;
