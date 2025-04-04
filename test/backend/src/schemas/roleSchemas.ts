import z from "zod";
import { SOutputUser } from "./userSchemas.js";

export const SRoleCore = z.object({
    libelle: z.string().max(32, "Libelle must be at most 32 characters long"),
});

export const SInputRole = SRoleCore;

export const SPartialRole = SRoleCore.partial();

export const SOutputRole: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        libelle: z
            .string()
            .max(32, "Libelle must be at most 32 characters long"),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        users: z.array(SOutputUser).optional(),
    }),
);

export type PartialRole = z.infer<typeof SPartialRole>;
export type InputRole = z.infer<typeof SInputRole>;
export type OutputRole = z.infer<typeof SOutputRole>;
