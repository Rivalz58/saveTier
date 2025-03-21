import z from "zod";

export const STierlistLineImageCore = z.object({
    placement: z.number().nonnegative().default(0),
    disable: z.boolean().default(false),
    id_tierlist_line: z.number().positive(),
});

export const SInputTierlistLineImage = STierlistLineImageCore.extend({
    id_image: z.number().positive(),
});

export const SPartialTierlistLineImage = STierlistLineImageCore.partial();

export const STierlistLineImage = z.object({
    id: z.number().positive(),
    placement: z.number().nonnegative().default(0),
    disable: z.boolean().default(false),
    id_tierlist_line: z.number().positive(),
    id_image: z.number().positive(),
});

export const SOutputTierlistLineImage = STierlistLineImage.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type TierlistLineImage = z.infer<typeof STierlistLineImage>;
export type PartialTierlistLineImage = z.infer<
    typeof SPartialTierlistLineImage
>;
export type InputTierlistLineImage = z.infer<typeof SInputTierlistLineImage>;
export type OutputTierlistLineImage = z.infer<typeof SOutputTierlistLineImage>;
