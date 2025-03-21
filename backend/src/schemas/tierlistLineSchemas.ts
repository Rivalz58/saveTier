import z from "zod";

export const STierlistLineCore = z.object({
    label: z
        .string()
        .max(32, "Lable must be at most 32 characters long")
        .optional(),
    placement: z.number().nonnegative().default(0),
    color: z.string().max(6),
});

export const SInputTierlistLine = STierlistLineCore.extend({
    id_tierlist: z.number().positive(),
});

export const SPartialTierlistLine = STierlistLineCore.partial();

export const STierlistLine = z.object({
    id: z.number().positive(),
    label: z
        .string()
        .max(32, "Lable must be at most 32 characters long")
        .optional(),
    placement: z.number().nonnegative().default(0),
    color: z.string().max(6),
    id_tierlist: z.number().positive(),
});

export const SOutputTierlistLine = STierlistLine.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type TierlistLine = z.infer<typeof STierlistLine>;
export type PartialTierlistLine = z.infer<typeof SPartialTierlistLine>;
export type InputTierlistLine = z.infer<typeof SInputTierlistLine>;
export type OutputTierlistLine = z.infer<typeof SOutputTierlistLine>;
