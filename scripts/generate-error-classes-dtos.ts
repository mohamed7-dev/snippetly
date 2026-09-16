import fs from 'node:fs';
import path from 'node:path';
import { pathToFileURL } from 'node:url';
import { ZodObject } from 'zod';

const API_ERROR_NAME = 'ApiError';

export async function generateErrorClasses(schemasDirPaths: string[], outputPath: string) {
    const schemaFiles = findSchemaFiles(schemasDirPaths);

    const schemas = await collectSchemas(schemaFiles);
    if (schemas.length === 0) {
        console.warn('No error schemas found — check your naming heuristic.');
        return;
    }

    // write global imports
    const globalImports = [
        `/* eslint-disable */
/**
 * ---------------------------------------------------------
 * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
 * ---------------------------------------------------------
 */`,

        'import { z } from "zod"',
        `import { ${schemas.map(schema => schema.exportName).join(',')} } from "@snippetly/common/dto"`,
        ' ',
    ].join('\n');

    fs.writeFileSync(outputPath, globalImports);

    // write ApiError class to the outputPath
    const source = [
        `export class ${API_ERROR_NAME} {`,
        `  readonly code: string;`,
        `  readonly httpStatusCode: number;`,
        `  readonly message: string;`,
        `}`,
    ].join('\n');
    fs.appendFileSync(outputPath, source);

    for (const found of schemas) {
        const source = generateClassSource(found);
        fs.appendFileSync(outputPath, source);
    }
}

function findSchemaFiles(dirPaths: string[]): string[] {
    return dirPaths.flatMap(dirPath => {
        const entries = fs.readdirSync(dirPath, { withFileTypes: true });
        return entries.flatMap(entry => {
            const full = path.join(dirPath, entry.name);
            if (entry.isDirectory()) return findSchemaFiles([full]);
            if (/\.(ts|js)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) return [full];
            return [];
        });
    });
}

type FoundSchema = {
    filePath: string;
    exportName: string;
    schema: ZodObject<any>;
    className: string;
};

async function collectSchemas(files: string[]): Promise<FoundSchema[]> {
    const foundSchemas: FoundSchema[] = [];
    for (const filePath of files) {
        const mod = await import(pathToFileURL(resolveImportPath(filePath)).href);
        for (const [exportName, value] of Object.entries(mod)) {
            if (looksLikeErrorSchema(exportName, value)) {
                foundSchemas.push({
                    filePath,
                    exportName,
                    schema: value as any,
                    className: toClassName(exportName),
                });
            }
        }
    }

    return foundSchemas;
}

function resolveImportPath(filePath: string) {
    if (!filePath.endsWith('.ts') || !filePath.includes(`${path.sep}src${path.sep}`)) {
        return filePath;
    }

    const compiledPath = filePath
        .replace(`${path.sep}src${path.sep}`, `${path.sep}dist${path.sep}`)
        .replace(/\.ts$/, '.js');
    return fs.existsSync(compiledPath) ? compiledPath : filePath;
}

function looksLikeErrorSchema(exportName: string, schema: unknown) {
    if (!(schema instanceof ZodObject)) return false;

    const nameMatches = /Error$/.test(exportName);
    const shape = schema.shape;
    const hasMessage = 'message' in shape;
    const hasCode = 'code' in shape;
    const hasHttpStatusCode = 'httpStatusCode' in shape;
    return nameMatches && hasMessage && hasCode && hasHttpStatusCode;
}

function generateClassSource(foundSchema: FoundSchema) {
    const { className, exportName, schema } = foundSchema;
    const fields = Object.keys(schema.shape);
    const constructorArgs = fields.filter(f => f !== 'code' && f !== 'httpStatusCode' && f !== 'message');
    return `
type ${className}Data = z.infer<typeof ${exportName}>;

export class ${className} extends ${API_ERROR_NAME} {
    readonly code:${className}Data["code"] = '${schema.shape.code.def.values[0]}';
    readonly httpStatusCode:${className}Data["httpStatusCode"] = ${schema.shape.httpStatusCode.def.values[0]};
    readonly message:${className}Data["message"] = '${schema.shape.code.def.values[0]}';
    ${constructorArgs.map(f => `  readonly ${f}: ${className}Data["${f}"];`).join('\n')}

    constructor( ${constructorArgs.length ? `data: Omit<${className}Data,"httpStatusCode" | "code" | "message">` : ``}) {
        super();
    ${constructorArgs.map(f => `    this.${f} = data.${f};`).join('\n')}
        Object.setPrototypeOf(this, ${className}.prototype);
  }
}
    `;
}

function toClassName(exportName: string) {
    const stripped = exportName.replace(/Schema$/, '');
    return stripped.charAt(0).toUpperCase() + stripped.slice(1);
}
