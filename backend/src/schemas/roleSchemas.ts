import z from "zod";

export const SRoleCore = z.object({
    libelle: z.string().max(32, "Libelle must be at most 32 characters long"),
});

export const SInputRole = SRoleCore;

export const SPartialRole = SRoleCore.partial();

export const SRole = z.object({
    id: z.number().positive(),
    libelle: z.string().max(32, "Libelle must be at most 32 characters long"),
});

export const SOutputRole = SRole.extend({
    createAt: z.date().optional(),
    updateAt: z.date().optional(),
});

export type Role = z.infer<typeof SRole>;
export type PartialRole = z.infer<typeof SPartialRole>;
export type InputRole = z.infer<typeof SInputRole>;
export type OutputRole = z.infer<typeof SOutputRole>;
