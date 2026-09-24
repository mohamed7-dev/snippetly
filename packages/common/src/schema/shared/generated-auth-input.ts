/* eslint-disable */
// --------------------------------------------------
// ⚠️ THIS FILE IS AUTO-GENERATED
// DO NOT EDIT MANUALLY
// --------------------------------------------------

import { z } from 'zod';

export const adminAuthInput = z.object({
    native: z.object({
        identifier: z.string().nonempty(),
        password: z.string().nonempty(),
        rememberMe: z.boolean().optional(),
    }),
});

export const developerAuthInput = z.object({
    native: z.object({
        identifier: z.string().nonempty(),
        password: z.string().nonempty(),
        rememberMe: z.boolean().optional(),
    }),
});

// ================= TYPES =================

export type AdminAuthInput = z.infer<typeof adminAuthInput>;

export type DeveloperAuthInput = z.infer<typeof developerAuthInput>;
