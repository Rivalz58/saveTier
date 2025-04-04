import z from "zod";
import { SOutputTierlistLineImage } from "./tierlistLineImageSchemas.js";

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

export const SOutputTierlistLine: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        label: z
            .string()
            .max(32, "Lable must be at most 32 characters long")
            .optional()
            .nullable(),
        placement: z.number().nonnegative(),
        color: z.string().max(6),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        tierlistLineImage: z.array(SOutputTierlistLineImage).optional(),
    }),
);

export type PartialTierlistLine = z.infer<typeof SPartialTierlistLine>;
export type InputTierlistLine = z.infer<typeof SInputTierlistLine>;
export type OutputTierlistLine = z.infer<typeof SOutputTierlistLine>;
