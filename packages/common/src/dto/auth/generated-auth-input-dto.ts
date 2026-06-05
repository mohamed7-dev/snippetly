/* eslint-disable */
// --------------------------------------------------
// ⚠️ THIS FILE IS AUTO-GENERATED
// DO NOT EDIT MANUALLY
// --------------------------------------------------

import { z } from "zod";

export const adminAuthInputDto = z.object({
      credentials: 
            z.object({
                identifier: z.string(),
                password: z.string().min(8).max(32),
                rememberMe:z.boolean().optional(),
            })
        ,
});

export const developerAuthInputDto = z.object({
      credentials: 
            z.object({
                identifier: z.string(),
                password: z.string().min(8).max(32),
                rememberMe:z.boolean().optional(),
            })
        ,
});


// ================= TYPES =================

export type AdminAuthInputDto = z.infer<typeof adminAuthInputDto>;

export type DeveloperAuthInputDto = z.infer<typeof developerAuthInputDto>;
            