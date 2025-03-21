import z from "zod";

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
    last_connexion: z.date().default(() => new Date()),
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

export const SUser = z.object({
    id: z.number().positive(),
    username: z
        .string()
        .min(3, "Username must be at least 3 characters long")
        .max(16, "Username must be at most 16 characters long")
        .regex(
            /^[a-zA-Z0-9_]+$/,
            "Username can only contain letters, numbers, and underscores",
        ),
    status: z.nativeEnum(Status).default(Status.active),
    last_connexion: z.date().default(() => new Date()),
});

export const SOutputUser = SUser.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type User = z.infer<typeof SUser>;
export type PartialUser = z.infer<typeof SPartialUser>;
export type InputUser = z.infer<typeof SInputUser>;
export type OutputUser = z.infer<typeof SOutputUser>;
