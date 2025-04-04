import z from "zod";
import { SOutputImage } from "./imageSchemas.js";
import { SOutputTournamentOponent } from "./tournamentOponentSchemas.js";

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

export const SOutputTournamentImage: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        lose: z.boolean(),
        place: z.number().nonnegative(),
        turn: z.number().nonnegative(),
        disable: z.boolean(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        image: SOutputImage.optional(),
        tournamentOponent: z.array(SOutputTournamentOponent).optional(),
    }),
);

export type PartialTournamentImage = z.infer<typeof SPartialTournamentImage>;
export type InputTournamentImage = z.infer<typeof SInputTournamentImage>;
export type OutputTournamentImage = z.infer<typeof SOutputTournamentImage>;
