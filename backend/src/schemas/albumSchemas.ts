import z from "zod";

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

export const SAlbum = z.object({
    id: z.number().positive(),
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
    status: z.nativeEnum(Status).default(Status.private),
    id_user: z.number().positive(),
});

export const SOutputAlbum = SAlbum.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type Album = z.infer<typeof SAlbum>;
export type PartialAlbum = z.infer<typeof SPartialAlbum>;
export type InputAlbum = z.infer<typeof SInputAlbum>;
export type OutputAlbum = z.infer<typeof SOutputAlbum>;
