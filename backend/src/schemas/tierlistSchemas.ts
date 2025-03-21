import z from "zod";

export const STierlistCore = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
    description: z
        .string()
        .max(512, "Description must be a maximum 512 characters")
        .optional(),
    private: z.boolean().default(true),
});

export const SInputTierlist = STierlistCore.extend({
    id_album: z.number().positive(),
});

export const SPartialTierlist = STierlistCore.partial();

export const STierlist = z.object({
    id: z.number().positive(),
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
    description: z
        .string()
        .max(512, "Description must be a maximum 512 characters")
        .optional(),
    private: z.boolean().default(true),
    id_album: z.number().positive(),
    id_user: z.number().positive(),
});

export const SOutputTierlist = STierlist.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type Tierlist = z.infer<typeof STierlist>;
export type PartialTierlist = z.infer<typeof SPartialTierlist>;
export type InputTierlist = z.infer<typeof SInputTierlist>;
export type OutputTierlist = z.infer<typeof SOutputTierlist>;
