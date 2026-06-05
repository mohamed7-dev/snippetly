import { getNormalizedAppPermissions, Logger } from '@snippetly/server';
import fs from 'fs/promises';
import { LoggerContextName } from './generate';

export async function generatePermissionEnum(outputPath: string) {
    const permissions = getNormalizedAppPermissions();

    const keys = Array.from(new Set(permissions.map(p => p.key)));

    const enumValues = keys.map(k => `  ${k} = "${k}",`).join('\n');

    const unionValues = keys.map(k => `"${k}"`).join(' | ');

    const file = `/* eslint-disable */
/**
 * ---------------------------------------------------------
 * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
 * ---------------------------------------------------------
 */
import {z} from "zod"

export enum Permission {
${enumValues}
}

export const permissionEnumDto = z.enum(Object.values(Permission));

export type PermissionKey = ${unionValues};
`;

    try {
        await fs.writeFile(outputPath, file);
        Logger.info('Permission enum generated successfully', LoggerContextName);
    } catch (error) {
        Logger.error(
            `[${LoggerContextName}]: failed to generate Permission enum, ${error instanceof Error ? error.message : JSON.stringify(error)}`,
        );
    }
}
