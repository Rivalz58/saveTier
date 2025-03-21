import z from "zod";

export const SCategoryCore = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
});

export const SInputCategory = SCategoryCore;

export const SPartialCategory = SCategoryCore.partial();

export const SCategory = z.object({
    id: z.number().positive(),
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
});

export const SOutputCategory = SCategory.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type Category = z.infer<typeof SCategory>;
export type PartialCategory = z.infer<typeof SPartialCategory>;
export type InputCategory = z.infer<typeof SInputCategory>;
export type OutputCategory = z.infer<typeof SOutputCategory>;
