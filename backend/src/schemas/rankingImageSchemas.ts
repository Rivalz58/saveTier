import z from "zod";
import { SOutputImage } from "./imageSchemas.js";

export const SRankingImageCore = z.object({
    points: z.number().nonnegative().default(0),
    viewed: z.number().nonnegative().default(0),
    disable: z.boolean().default(false),
});

export const SInputRankingImage = SRankingImageCore.extend({
    id_image: z.number().positive(),
    id_ranking: z.number().positive(),
});

export const SPartialRankingImage = SRankingImageCore.partial();

export const SOutputRankingImage: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        points: z.number().nonnegative().default(0),
        viewed: z.number().nonnegative().default(0),
        disable: z.boolean(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        image: SOutputImage.optional(),
    }),
);

export type PartialRankingImage = z.infer<typeof SPartialRankingImage>;
export type InputRankingImage = z.infer<typeof SInputRankingImage>;
export type OutputRankingImage = z.infer<typeof SOutputRankingImage>;
