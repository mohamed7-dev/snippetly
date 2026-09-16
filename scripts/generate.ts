import { bootstrap } from '@snippetly/server';
import path from 'node:path';
import { generateErrorClasses } from './generate-error-classes-dtos';

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

            await generateErrorClasses(
                [
                    path.resolve('.', 'packages', 'common', 'src', 'dto', 'developer'),
                    path.resolve('.', 'packages', 'common', 'src', 'dto', 'shared'),
                ],
                path.resolve(
                    '.',
                    'apps',
                    'server',
                    'src',
                    'common',
                    'errors',
                    'generated-developer-errors.ts',
                ),
            );

            // await generateAuthInputDto(
            //     path.resolve('.', 'packages', 'common', 'src', 'dto', 'shared', 'generated-auth-input.ts'),
            //     app as App,
            // );

            // await generatePermissionEnum(
            //     path.resolve('.', 'packages', 'common', 'src', 'dto', 'shared', 'generated-permission.ts'),
            // );

            // await generateLanguageCodeEnum(
            //     path.resolve('.', 'packages', 'common', 'src', 'dto', 'shared', 'generated-language-code.ts'),
            // );
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
