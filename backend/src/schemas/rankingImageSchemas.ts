import z from "zod";

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

export const SRankingImage = z.object({
    id: z.number().positive(),
    points: z.number().nonnegative().default(0),
    viewed: z.number().nonnegative().default(0),
    disable: z.boolean().default(false),
    id_image: z.number().positive(),
    id_ranking: z.number().positive(),
});

export const SOutputRankingImage = SRankingImage.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type RankingImage = z.infer<typeof SRankingImage>;
export type PartialRankingImage = z.infer<typeof SPartialRankingImage>;
export type InputRankingImage = z.infer<typeof SInputRankingImage>;
export type OutputRankingImage = z.infer<typeof SOutputRankingImage>;
