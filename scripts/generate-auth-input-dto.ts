import { App, ConfigService, Logger } from '@snippetly/server';
import fs from 'fs/promises';
import { LoggerContextName } from './generate';

export async function generateAuthInputDto(outputPath: string, app: App) {
    const configService = app.getProvider<ConfigService>(ConfigService);
    const { adminAuthenticationStrategies, developerAuthenticationStrategies } = configService.authOptions;

    const adminSchemas = adminAuthenticationStrategies
        .map(s => `  ${s.name}: ${s.defineZodSchemaSource()},`)
        .join('\n');

    const developerSchemas = developerAuthenticationStrategies
        .map(s => `  ${s.name}: ${s.defineZodSchemaSource()},`)
        .join('\n');

    const fileContent = buildFile(adminSchemas, developerSchemas);

    try {
        await fs.writeFile(outputPath, fileContent);
        Logger.info('Auth input DTO generated successfully', LoggerContextName);
    } catch (error) {
        Logger.error(
            `Failed to generate auth input schema, ${error instanceof Error ? error.message : JSON.stringify(error)}`,
            LoggerContextName,
        );
    }
}

function buildFile(adminSchemas: string, developerSchemas: string) {
    return `/* eslint-disable */
// --------------------------------------------------
// ⚠️ THIS FILE IS AUTO-GENERATED
// DO NOT EDIT MANUALLY
// --------------------------------------------------

import { z } from "zod";

export const adminAuthInputDto = z.object({
    ${adminSchemas}
});

export const developerAuthInputDto = z.object({
    ${developerSchemas}
});


// ================= TYPES =================

export type AdminAuthInputDto = z.infer<typeof adminAuthInputDto>;

export type DeveloperAuthInputDto = z.infer<typeof developerAuthInputDto>;
            `;
}
