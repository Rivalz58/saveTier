import z from "zod";
import { SOutputImage } from "./imageSchemas.js";

export const STierlistLineImageCore = z.object({
    placement: z.number().nonnegative().default(0),
    disable: z.boolean().default(false),
    id_tierlist_line: z.number().positive(),
});

export const SInputTierlistLineImage = STierlistLineImageCore.extend({
    id_image: z.number().positive(),
});

export const SPartialTierlistLineImage = STierlistLineImageCore.partial();

export const SOutputTierlistLineImage: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        placement: z.number().nonnegative().default(0),
        disable: z.boolean(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        image: SOutputImage.optional(),
    }),
);

export type PartialTierlistLineImage = z.infer<
    typeof SPartialTierlistLineImage
>;
export type InputTierlistLineImage = z.infer<typeof SInputTierlistLineImage>;
export type OutputTierlistLineImage = z.infer<typeof SOutputTierlistLineImage>;
