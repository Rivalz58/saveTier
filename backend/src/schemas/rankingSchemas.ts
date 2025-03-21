import z from "zod";

export const SRankingCore = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
    description: z
        .string()
        .max(512, "Description must be a maximum of 512 characters")
        .optional(),
    private: z.boolean().default(true),
});

export const SInputRanking = SRankingCore.extend({
    id_album: z.number().positive(),
});

export const SPartialRanking = SRankingCore.partial();

export const SRanking = z.object({
    id: z.number().positive(),
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
    description: z
        .string()
        .max(512, "Description must be a maximum of 512 characters")
        .optional(),
    private: z.boolean().default(true),
    id_album: z.number().positive(),
    id_user: z.number().positive(),
});

export const SOutputRanking = SRanking.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type Ranking = z.infer<typeof SRanking>;
export type PartialRanking = z.infer<typeof SPartialRanking>;
export type InputRanking = z.infer<typeof SInputRanking>;
export type OutputRanking = z.infer<typeof SOutputRanking>;
