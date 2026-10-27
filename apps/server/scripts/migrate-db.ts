import { spawn } from 'node:child_process';

const mode = process.argv[2];
const migrationName = process.argv[3];

const commands: Record<string, string[]> = {
    run: ['migration:run'],
    revert: ['migration:revert'],
    generate: ['migration:generate', `migrations/${migrationName}`],
};

if (!mode || !commands[mode]) {
    throw new Error('Usage: pnpm db:migration <generate|run|revert> [name]');
}

if (mode === 'generate' && !migrationName) {
    throw new Error('Migration name is required for generate');
}

const child = spawn(
    'ts-node',
    [
        '--project',
        './scripts/tsconfig.migration.json',
        '-r',
        'tsconfig-paths/register',
        './node_modules/typeorm/cli.js',
        '-d',
        './scripts/migration-data-source.ts',
        ...commands[mode],
    ],
    {
        stdio: 'inherit',
    },
);

child.on('exit', code => {
    process.exit(code ?? 1);
});
