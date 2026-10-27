import z from 'zod';
import { InferDtoType } from '../shared/common-schemas.js';

const codeEditorSettings = z.object({
    theme: z.enum(['system', 'ayu-light', 'one-dark', 'dracula']),
    fontSize: z.union([
        z.literal(10),
        z.literal(12),
        z.literal(14),
        z.literal(16),
        z.literal(18),
        z.literal(20),
        z.literal(24),
    ]),
    fontFamily: z.enum(['geist-mono', 'system-mono']),
    tabSize: z.union([z.literal(2), z.literal(4), z.literal(8)]),
    lineWrapping: z.boolean(),
    lineNumbers: z.boolean(),
});

const developerPreferences = z.object({
    theme: z.enum(['light', 'dark', 'system']),
    colorScheme: z.enum(['retro', 'coding', 'classic']),
    codeEditor: codeEditorSettings,
    inAppNotificationsEnabled: z.boolean(),
    isPushEnabled: z.boolean(),
});

export const getDeveloperPreferencesDto = {
    output: z.object({
        preferences: developerPreferences,
        isInitialized: z.boolean(),
    }),
};

export const updateDeveloperPreferencesDto = {
    input: developerPreferences
        .partial()
        .extend({ codeEditor: codeEditorSettings.partial().optional() })
        .refine(value => Object.keys(value).length > 0, 'At least one preference must be provided.'),
    output: developerPreferences,
};

export type GetDeveloperPreferencesDtoType = InferDtoType<typeof getDeveloperPreferencesDto>;
export type UpdateDeveloperPreferencesDtoType = InferDtoType<typeof updateDeveloperPreferencesDto>;
