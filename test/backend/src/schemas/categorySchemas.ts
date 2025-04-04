import z from "zod";
import { SOutputAlbum } from "./albumSchemas.js";

export const SCategoryCore = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
});

export const SInputCategory = SCategoryCore;

export const SPartialCategory = SCategoryCore.partial();

export const SOutputCategory: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        name: z
            .string()
            .min(3, { message: "Name must be at least 3 characters long" })
            .max(64, { message: "Name must be at most 64 characters long" }),
        albums: z.array(SOutputAlbum).optional(),
    }),
);

export type PartialCategory = z.infer<typeof SPartialCategory>;
export type InputCategory = z.infer<typeof SInputCategory>;
export type OutputCategory = z.infer<typeof SOutputCategory>;
