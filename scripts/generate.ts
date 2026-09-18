import { App, bootstrap, Logger, LogLevel, StdoutLoggerStrategy } from '@snippetly/server';
import path from 'node:path';
import { generateAuthInputDto } from './generate-auth-input-dto';
import { generateErrorClasses } from './generate-error-classes-dtos';
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
        system: {
            loggerStrategy: new StdoutLoggerStrategy({ logLevel: LogLevel.debug }),
        },
    });

    return cachedAppPromise;
}

async function generateTypes() {
    await startServer()
        .then(async app => {
            Logger.info('Attempting to generate types...', LoggerContextName);

            await generateErrorClasses(
                [
                    path.resolve('.', 'packages', 'common', 'src', 'schema', 'developer'),
                    path.resolve('.', 'packages', 'common', 'src', 'schema', 'shared'),
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

            await generateAuthInputDto(
                path.resolve('.', 'packages', 'common', 'src', 'schema', 'shared', 'generated-auth-input.ts'),
                app as App,
            );

            await generatePermissionEnum(
                path.resolve('.', 'packages', 'common', 'src', 'schema', 'shared', 'generated-permission.ts'),
            );

            await generateLanguageCodeEnum(
                path.resolve(
                    '.',
                    'packages',
                    'common',
                    'src',
                    'schema',
                    'shared',
                    'generated-language-code.ts',
                ),
            );
        })
        .then(() => {
            Logger.info('Types generated successfully', LoggerContextName);
            process.exit(0);
        })
        .catch(e => {
            Logger.error(
                `Generation script failure, ${e instanceof Error ? e.message : JSON.stringify(e)}`,
                LoggerContextName,
            );

            process.exit(1);
        });
}

generateTypes();
