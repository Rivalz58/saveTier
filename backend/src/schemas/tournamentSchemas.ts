import z from "zod";
import { SOutputTournamentImage } from "./tournamentImageSchemas.js";
import { SOutputUser } from "./userSchemas.js";
import { SOutputAlbum } from "./albumSchemas.js";

export const STournamentCore = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
    description: z
        .string()
        .max(512, "Description must be a maximum of 512 characters")
        .optional(),
    turn: z.number().nonnegative().default(0),
    private: z.boolean().default(true),
});

export const SInputTournament = STournamentCore.extend({
    id_album: z.number().positive(),
});

export const SPartialTournament = STournamentCore.partial();

export const SOutputTournament: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        name: z
            .string()
            .min(3, "Name must be at least 3 characters long")
            .max(64, "Name must be at most 64 characters long"),
        description: z
            .string()
            .max(512, "Description must be a maximum of 512 characters")
            .optional()
            .nullable(),
        turn: z.number().nonnegative(),
        private: z.boolean(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        author: SOutputUser.optional(),
        album: SOutputAlbum.optional(),
        tournamentImage: z.array(SOutputTournamentImage).optional(),
    }),
);

export type PartialTournament = z.infer<typeof SPartialTournament>;
export type InputTournament = z.infer<typeof SInputTournament>;
export type OutputTournament = z.infer<typeof SOutputTournament>;
