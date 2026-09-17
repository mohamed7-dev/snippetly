/* eslint-disable */
// --------------------------------------------------
// ⚠️ THIS FILE IS AUTO-GENERATED
// DO NOT EDIT MANUALLY
// --------------------------------------------------

import { z } from "zod";

export const adminAuthInput = z.object({
      native: 
            z.object({
                identifier: z.string(),
                password: z.string().min(8).max(32),
                rememberMe:z.boolean().optional(),
            })
        ,
});

export const developerAuthInput = z.object({
      native: 
            z.object({
                identifier: z.string(),
                password: z.string().min(8).max(32),
                rememberMe:z.boolean().optional(),
            })
        ,
});


// ================= TYPES =================

export type AdminAuthInput = z.infer<typeof adminAuthInput>;

export type DeveloperAuthInput = z.infer<typeof developerAuthInput>;
            