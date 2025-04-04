import z from "zod";
import { SOutputRole } from "./roleSchemas.js";
import { SOutputAlbum } from "./albumSchemas.js";
import { SOutputTierlist } from "./tierlistSchemas.js";
import { SOutputTournament } from "./tournamentSchemas.js";
import { SOutputRanking } from "./rankingSchemas.js";

export enum Status {
    active = "active",
    desactive = "desactive",
    ban = "ban",
}

export const SUserCore = z.object({
    username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(16, "Username must be at most 16 characters long")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores",
        ),
    status: z.nativeEnum(Status).default(Status.active),
    last_connection: z.date().default(() => new Date()),
});

export const SInputUser = SUserCore.extend({
    nametag: z
        .string()
        .min(3, "Nametag must be at least 3 characters long")
        .max(16, "Nametag must be at most 16 characters long")
        .regex(
            /^[a-z0-9_]+$/,
            "Nametag can only contain letters, numbers, and underscores",
        ),
    email: z.string().email("Invalid email format"),
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(32, "Password must be at most 32 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(
            /[\W_]/,
            "Password must contain at least one special character (e.g., !, @, #, $)",
        ),
});

export const SPartialUser = SUserCore.extend({
    password: z
        .string()
        .min(8, "Password must be at least 8 characters long")
        .max(32, "Password must be at most 32 characters long")
        .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
        .regex(/[a-z]/, "Password must contain at least one lowercase letter")
        .regex(/\d/, "Password must contain at least one number")
        .regex(
            /[\W_]/,
            "Password must contain at least one special character (e.g., !, @, #, $)",
        ),
}).partial();

export const SOutputUser: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        username: z
            .string()
            .min(3, "Username must be at least 3 characters long")
            .max(16, "Username must be at most 16 characters long")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores",
            ),
        nametag: z
            .string()
            .min(3, "Nametag must be at least 3 characters long")
            .max(16, "Nametag must be at most 16 characters long")
            .regex(
                /^[a-z0-9_]+$/,
                "Nametag can only contain letters, numbers, and underscores",
            ),
        email: z.string().email("Invalid email format").optional(),
        status: z.nativeEnum(Status).default(Status.active),
        last_connection: z.date().default(() => new Date()),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        roles: z.array(SOutputRole).optional(),
        albums: z.array(SOutputAlbum).optional(),
        tierlists: z.array(SOutputTierlist).optional(),
        tournaments: z.array(SOutputTournament).optional(),
        rankings: z.array(SOutputRanking).optional(),
    }),
);

export type PartialUser = z.infer<typeof SPartialUser>;
export type InputUser = z.infer<typeof SInputUser>;
export type OutputUser = z.infer<typeof SOutputUser>;
