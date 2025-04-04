import z from "zod";

export const STournamentOponentCore = z.object({
    id_oponent: z.number().positive(),
});

export const SInputTournamentOponent = STournamentOponentCore.extend({
    id_tournament_image: z.number().positive(),
});

export const SPartialTournamentOponent = STournamentOponentCore.partial();

export const SOutputTournamentOponent: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        id_oponent: z.number().positive(),
        id_tournament_image: z.number().positive(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
    }),
);

export type PartialTournamentOponent = z.infer<
    typeof SPartialTournamentOponent
>;
export type InputTournamentOponent = z.infer<typeof SInputTournamentOponent>;
export type OutputTournamentOponent = z.infer<typeof SOutputTournamentOponent>;
