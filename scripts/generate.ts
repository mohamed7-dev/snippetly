import { App, bootstrap } from '@snippetly/server';
import path from 'node:path';
import { generateAuthInputDto } from './generate-auth-input-dto';
import { generateErrorsDtos } from './generate-errors-dtos';
import { generateLanguageCodeEnum } from './generate-language-code-enum';
import { generatePermissionEnum } from './generate-permissions-enum';

let cachedAppPromise: Promise<any> | undefined = undefined;

export const LoggerContextName = 'GenerationScript';

async function startServer() {
    if (cachedAppPromise) return cachedAppPromise;
    cachedAppPromise = bootstrap({
        api: {
            port: 3030,
        },
        database: {
            type: 'sqljs',
            synchronize: true,
            logging: false,
        },
    });

    return cachedAppPromise;
}

async function generateTypes() {
    await startServer()
        .then(async app => {
            console.log('Attempting to generate types...');
            await generateErrorsDtos(
                path.resolve('.', 'packages', 'common', 'src', 'dto', 'generated-errors-dtos.ts'),
            );

            await generateAuthInputDto(
                path.resolve('.', 'packages', 'common', 'src', 'dto', 'auth', 'generated-auth-input-dto.ts'),
                app as App,
            );

            await generatePermissionEnum(
                path.resolve('.', 'packages', 'common', 'src', 'dto', 'generated-permission-dto.ts'),
            );

            await generateLanguageCodeEnum(
                path.resolve('.', 'packages', 'common', 'src', 'dto', 'generated-language-code-dto.ts'),
            );
        })
        .then(() => {
            console.log('Types generated successfully');
            process.exit(0);
        })
        .catch(err => {
            console.error(err);
            process.exit(1);
        });
}

generateTypes();
