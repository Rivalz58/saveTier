import z from "zod";

export const SImageCore = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
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
    path_image: z
        .string()
        .url("Invalid path image")
        .max(1024, "Url must be a maximum 1024 characters"),
    id_album: z.number().positive(),
});

export const SPartialImage = SImageCore.partial();

export const SImage = z.object({
    id: z.number().positive(),
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
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
    path_image: z
        .string()
        .url("Invalid path image")
        .max(1024, "Url must be a maximum 1024 characters"),
    id_album: z.number().positive(),
});

export const SOutputImage = SImage.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type Image = z.infer<typeof SImage>;
export type PartialImage = z.infer<typeof SPartialImage>;
export type InputImage = z.infer<typeof SInputImage>;
export type OutputImage = z.infer<typeof SOutputImage>;
