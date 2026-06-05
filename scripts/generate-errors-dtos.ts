import { Schemable, schemableErrors } from '@snippetly/common/errors';
import { Logger } from '@snippetly/server';
import fs from 'node:fs/promises';

export const LoggerContextName = 'AuoGenerationScript';

function isSchemable(value: any): boolean {
    return (
        typeof value === 'function' && value.prototype && typeof value.prototype.defineSchema === 'function'
    );
}

function toCamelCase(name: string) {
    return name.charAt(0).toLowerCase() + name.slice(1);
}

function toPascalCase(name: string) {
    return name.charAt(0).toUpperCase() + name.slice(1);
}

export async function generateErrorsDtos(outputPath: string) {
    try {
        const lines: string[] = [];
        lines.push(`/* eslint-disable */`);
        lines.push(`// ⚠️ AUTO-GENERATED FILE — DO NOT EDIT`);
        lines.push(`import { z } from "zod";\n`);
        for (const exported of Object.values(schemableErrors)) {
            if (!isSchemable(exported)) continue;

            // parameter is not important, we only care about the schema
            const instance: Schemable = new exported('generated' as any);

            const schema = instance.defineSchema();

            const className = exported.name;

            const dtoConstName = `${toCamelCase(className)}Dto`;
            const dtoTypeName = `${toPascalCase(className)}Dto`;

            lines.push(`
export const ${dtoConstName} = ${schema};

export type ${dtoTypeName} = z.infer<typeof ${dtoConstName}>;
`);
        }

        await fs.writeFile(outputPath, lines.join('\n'));
        Logger.info('Errors DTOs generated successfully', LoggerContextName);
    } catch (error) {
        Logger.error(
            `Failed to generate Errors DTOs, ${error instanceof Error ? error.message : JSON.stringify(error)}`,
            LoggerContextName,
        );
    }
}
