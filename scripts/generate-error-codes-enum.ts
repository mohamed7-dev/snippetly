import { Logger } from '@snippetly/server';
import fs from 'fs/promises';
import { LoggerContextName } from './generate';
import { getErrorCodes } from './generate-error-classes-dtos';

export async function generateErrorCodesEnum(schemasDirPaths: string[], outputPath: string) {
    try {
        const errorCodes = await getErrorCodes(schemasDirPaths);
        const enumValues = errorCodes.map(code => `  ${code} = "${code}",`).join('\n');
        const unionValues = errorCodes.map(code => `"${code}"`).join(' | ');

        const file = `/* eslint-disable */
/**
 * ---------------------------------------------------------
 * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
 * ---------------------------------------------------------
 */
import { z } from "zod";

export enum ErrorCode {
${enumValues}
}

export const errorCodeEnum = z.enum(Object.values(ErrorCode));

export type ErrorCodeKey = ${unionValues};
`;

        await fs.writeFile(outputPath, file);
        Logger.info('ErrorCode enum generated successfully', LoggerContextName);
    } catch (error) {
        Logger.error(
            `Failed to generate ErrorCode enum, ${error instanceof Error ? error.message : JSON.stringify(error)}`,
            LoggerContextName,
        );
    }
}
