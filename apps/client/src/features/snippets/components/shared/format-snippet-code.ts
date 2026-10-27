type PrettierPlugin = import('prettier').Plugin;
type FormatterConfig = {
    parser: string;
    loadPlugins: () => Promise<PrettierPlugin[]>;
};

const estreePlugins = async (): Promise<PrettierPlugin[]> => [
    await import('prettier/plugins/babel'),
    await import('prettier/plugins/estree'),
];
const typescriptPlugins = async (): Promise<PrettierPlugin[]> => [
    await import('prettier/plugins/typescript'),
    await import('prettier/plugins/estree'),
];

const parsers: Record<string, FormatterConfig> = {
    css: { parser: 'css', loadPlugins: async () => [await import('prettier/plugins/postcss')] },
    html: { parser: 'html', loadPlugins: async () => [await import('prettier/plugins/html')] },
    javascript: { parser: 'babel', loadPlugins: estreePlugins },
    json: { parser: 'json', loadPlugins: estreePlugins },
    jsonc: { parser: 'jsonc', loadPlugins: estreePlugins },
    jsx: { parser: 'babel', loadPlugins: estreePlugins },
    markdown: { parser: 'markdown', loadPlugins: async () => [await import('prettier/plugins/markdown')] },
    md: { parser: 'markdown', loadPlugins: async () => [await import('prettier/plugins/markdown')] },
    scss: { parser: 'scss', loadPlugins: async () => [await import('prettier/plugins/postcss')] },
    less: { parser: 'less', loadPlugins: async () => [await import('prettier/plugins/postcss')] },
    ts: { parser: 'typescript', loadPlugins: typescriptPlugins },
    tsx: { parser: 'typescript', loadPlugins: typescriptPlugins },
    typescript: { parser: 'typescript', loadPlugins: typescriptPlugins },
    yaml: { parser: 'yaml', loadPlugins: async () => [await import('prettier/plugins/yaml')] },
    yml: { parser: 'yaml', loadPlugins: async () => [await import('prettier/plugins/yaml')] },
};

const languageAliases: Record<string, string> = {
    js: 'javascript',
    md: 'markdown',
};

export async function formatSnippetCode(code: string, language: string): Promise<string> {
    const normalizedLanguage = languageAliases[language.toLowerCase()] ?? language.toLowerCase();
    const formatterConfig = parsers[normalizedLanguage];

    if (!formatterConfig) {
        throw new Error(`Formatting is not supported for ${language || 'this language'}.`);
    }

    const [prettier, plugins] = await Promise.all([
        import('prettier/standalone'),
        formatterConfig.loadPlugins(),
    ]);

    return prettier.format(code, {
        parser: formatterConfig.parser,
        plugins,
        useTabs: true,
    });
}
