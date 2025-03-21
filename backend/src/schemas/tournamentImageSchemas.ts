import z from "zod";

export const STournamentImageCore = z.object({
    lose: z.boolean().default(false),
    place: z.number().nonnegative().default(0),
    turn: z.number().nonnegative().default(0),
    disable: z.boolean().default(false),
});

export const SInputTournamentImage = STournamentImageCore.extend({
    id_image: z.number().positive(),
    id_tournament: z.number().positive(),
});

export const SPartialTournamentImage = STournamentImageCore.partial();

export const STournamentImage = z.object({
    id: z.number().positive(),
    lose: z.boolean().default(false),
    place: z.number().nonnegative().default(0),
    turn: z.number().nonnegative().default(0),
    disable: z.boolean().default(false),
    id_image: z.number().positive(),
    id_tournament: z.number().positive(),
});

export const SOutputTournamentImage = STournamentImage.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type TournamentImage = z.infer<typeof STournamentImage>;
export type PartialTournamentImage = z.infer<typeof SPartialTournamentImage>;
export type InputTournamentImage = z.infer<typeof SInputTournamentImage>;
export type OutputTournamentImage = z.infer<typeof SOutputTournamentImage>;
