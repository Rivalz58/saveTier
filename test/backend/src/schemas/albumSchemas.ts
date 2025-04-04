import z from "zod";
import { SOutputUser } from "./userSchemas.js";
import { SOutputCategory } from "./categorySchemas.js";
import { SOutputImage } from "./imageSchemas.js";

enum Status {
    private = "private",
    public = "public",
    desactive = "desactive",
}

export const SAlbumCore = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
    status: z.nativeEnum(Status).default(Status.private),
});

export const SInputAlbum = SAlbumCore;

export const SPartialAlbum = SAlbumCore.partial();

export const SOutputAlbum: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        name: z
            .string()
            .min(3, { message: "Name must be at least 3 characters long" })
            .max(64, { message: "Name must be at most 64 characters long" }),
        status: z.nativeEnum(Status).default(Status.private),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        categories: z.array(SOutputCategory).optional(),
        author: SOutputUser.optional(),
        image: z.array(SOutputImage).optional(),
    }),
);

export type PartialAlbum = z.infer<typeof SPartialAlbum>;
export type InputAlbum = z.infer<typeof SInputAlbum>;
export type OutputAlbum = z.infer<typeof SOutputAlbum>;
