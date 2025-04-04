import z from "zod";
import { SOutputTierlistLine } from "./tierlistLineSchemas.js";
import { SOutputUser } from "./userSchemas.js";
import { SOutputAlbum } from "./albumSchemas.js";

export const STierlistCore = z.object({
    name: z
        .string()
        .min(3, "Name must be at least 3 characters long")
        .max(64, "Name must be at most 64 characters long"),
    description: z
        .string()
        .max(512, "Description must be a maximum 512 characters")
        .optional(),
    private: z.boolean().default(true),
});

export const SInputTierlist = STierlistCore.extend({
    id_album: z.number().positive(),
});

export const SPartialTierlist = STierlistCore.partial();

export const SOutputTierlist: z.ZodType<any> = z.lazy(() =>
    z.object({
        id: z.number().positive(),
        name: z
            .string()
            .min(3, "Name must be at least 3 characters long")
            .max(64, "Name must be at most 64 characters long"),
        description: z
            .string()
            .max(512, "Description must be a maximum 512 characters")
            .optional()
            .nullable(),
        private: z.boolean(),
        createdAt: z.date().optional(),
        updatedAt: z.date().optional(),
        author: SOutputUser.optional(),
        album: SOutputAlbum.optional(),
        tierlistLine: z.array(SOutputTierlistLine).optional(),
    }),
);

export type PartialTierlist = z.infer<typeof SPartialTierlist>;
export type InputTierlist = z.infer<typeof SInputTierlist>;
export type OutputTierlist = z.infer<typeof SOutputTierlist>;
