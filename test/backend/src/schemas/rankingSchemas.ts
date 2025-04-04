import z from "zod";
import { SOutputUser } from "./userSchemas.js";
import { SOutputAlbum } from "./albumSchemas.js";
import { SOutputRankingImage } from "./rankingImageSchemas.js";

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

export const SOutputRanking: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        name: z
            .string()
            .min(3, "Name must be at least 3 characters long")
            .max(64, "Name must be at most 64 characters long"),
        description: z
            .string()
            .max(512, "Description must be a maximum of 512 characters")
            .nullable(),
        private: z.boolean(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        author: SOutputUser.optional(),
        album: SOutputAlbum.optional(),
        rankingImage: z.array(SOutputRankingImage).optional(),
    }),
);

export type PartialRanking = z.infer<typeof SPartialRanking>;
export type InputRanking = z.infer<typeof SInputRanking>;
export type OutputRanking = z.infer<typeof SOutputRanking>;
