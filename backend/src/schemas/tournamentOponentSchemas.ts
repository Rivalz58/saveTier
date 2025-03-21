import z from "zod";

export const STournamentOponentCore = z.object({
    id_oponent: z.number().positive(),
});

export const SInputTournamentOponent = STournamentOponentCore.extend({
    id_tournament_image: z.number().positive(),
});

export const SPartialTournamentOponent = STournamentOponentCore.partial();

export const STournamentOponent = z.object({
    id: z.number().positive(),
    id_oponent: z.number().positive(),
    id_tournament_image: z.number().positive(),
});

export const SOutputTournamentOponent = STournamentOponent.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type TournamentOponent = z.infer<typeof STournamentOponent>;
export type PartialTournamentOponent = z.infer<
    typeof SPartialTournamentOponent
>;
export type InputTournamentOponent = z.infer<typeof SInputTournamentOponent>;
export type OutputTournamentOponent = z.infer<typeof SOutputTournamentOponent>;
