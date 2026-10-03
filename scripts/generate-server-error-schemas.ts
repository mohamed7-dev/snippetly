import { Logger } from '@snippetly/server';
import fs from 'node:fs/promises';
import * as serverErrors from '../apps/server/src/common/errors/errors';
import { LoggerContextName } from './generate';

type ErrorInstance = {
    code?: unknown;
    httpStatusCode?: unknown;
    logLevel?: unknown;
    message?: unknown;
    variables?: unknown;
    [key: string]: unknown;
};

type ErrorConstructor = new (...args: unknown[]) => ErrorInstance;

export async function generateServerErrorSchemas(outputPath: string) {
    try {
        const samples = Object.entries(serverErrors)
            .filter(([, value]) => typeof value === 'function')
            .map(([name, value]) => {
                const ErrorType = value as unknown as ErrorConstructor;
                const error = new ErrorType(
                    'sample',
                    {
                        entityName: 'Developer',
                        entityId: 'sample',
                        path: '/sample',
                        sample: 'sample',
                    },
                    { field: 'sample' },
                );

                if (typeof error.code !== 'string' || typeof error.httpStatusCode !== 'number') {
                    throw new Error(`Could not read code and HTTP status from ${name}`);
                }

                return { name, error };
            })
            .sort((left, right) => String(left.error.code).localeCompare(String(right.error.code)));

        if (!samples.length) {
            throw new Error('No server error classes were found');
        }

        const schemas = samples.map(({ name, error }) => {
            const schemaName = `${name.charAt(0).toLowerCase()}${name.slice(1)}Schema`;
            const properties = new Map(
                Object.entries(error).filter(([key]) => key !== 'logLevel' && key !== 'variables'),
            );
            properties.set('message', error.message);
            const shape = Array.from(properties)
                .map(([key, value]) => `    ${key}: ${schemaForProperty(key, value)},`)
                .join('\n');

            return `export const ${schemaName} = z.object({\n${shape}\n});`;
        });
        const schemaNames = samples.map(
            ({ name }) => `${name.charAt(0).toLowerCase()}${name.slice(1)}Schema`,
        );

        const file = `/* eslint-disable */
/**
 * ---------------------------------------------------------
 * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
 * ---------------------------------------------------------
 */
import { z } from 'zod';

${schemas.join('\n\n')}

export const serverErrorSchema = z.discriminatedUnion('code', [
${schemaNames.map(schemaName => `    ${schemaName},`).join('\n')}
]);

export type ServerErrorDto = z.infer<typeof serverErrorSchema>;
`;

        await fs.writeFile(outputPath, file);
        Logger.info('Server error schemas generated successfully', LoggerContextName);
    } catch (error) {
        Logger.error(
            `Failed to generate server error schemas, ${error instanceof Error ? error.message : JSON.stringify(error)}`,
            LoggerContextName,
        );
        throw error;
    }
}

function schemaForProperty(key: string, value: unknown): string {
    if (key === 'code') return `z.literal(${JSON.stringify(value)})`;
    if (key === 'httpStatusCode') return `z.literal(${value})`;
    if (key === 'message') return 'z.string()';
    if (key === 'fields') return 'z.record(z.string(), z.string()).optional()';
    if (typeof value === 'string') return 'z.string().optional()';
    if (typeof value === 'number') return 'z.number().optional()';
    if (typeof value === 'boolean') return 'z.boolean().optional()';
    if (value === null) return 'z.null().optional()';
    if (typeof value === 'object') return 'z.record(z.string(), z.unknown()).optional()';
    return 'z.unknown().optional()';
}
