import z from "zod";

const SAuthCore = z.object({
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

export const SInputAuth = SAuthCore.extend({
    identifier: z
        .string()
        .min(3, "Nametag or email must be at least 3 characters long"),
});

export const SInputRegistration = SAuthCore.extend({
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
            /^[a-zA-Z0-9_]+$/,
            "Nametag can only contain letters, numbers, and underscores",
        ),
    email: z.string().email("Invalid email format"),
});

export const SPartialAuth = z
    .object({
        username: z
            .string()
            .min(3, "Username must be at least 3 characters long")
            .max(16, "Username must be at most 16 characters long")
            .regex(
                /^[a-zA-Z0-9_]+$/,
                "Username can only contain letters, numbers, and underscores",
            ),
    })
    .partial();

export const SInputAuthPassword = SAuthCore.extend({
    old_password: z
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

export const SInputForgotPassword = z.object({
    email: z.string().email("Invalid email format"),
});

export const SInputResetPassword = SAuthCore.extend({
    token: z.string(),
});

export type InputAuth = z.infer<typeof SInputAuth>;
export type InputRegistration = z.infer<typeof SInputRegistration>;
export type InputAuthPassword = z.infer<typeof SInputAuthPassword>;
export type PartialAuth = z.infer<typeof SPartialAuth>;
export type InputForgotPassword = z.infer<typeof SInputForgotPassword>;
export type InputResetPassword = z.infer<typeof SInputResetPassword>;
