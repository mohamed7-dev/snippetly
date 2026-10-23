import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useDeveloperSettings } from '@/features/developer-settings/hooks/use-developer-settings';
import type { CodeEditorSettings } from '@/features/developer-settings/providers/developer-settings-provider';
import { useTheme } from '@/hooks/use-theme';
import type { ApiSuccess } from '@/lib/api-client';
import type { FindOneSnippetDtoType } from '@snippetly/common/dto';
import { Maximize2Icon } from 'lucide-react';
import React from 'react';
import { CopyButton } from './copy-button';
import { SnippetCodeEditor } from './snippet-code-editor';
import { SnippetCodeEditorSettings } from './snippet-code-editor-settings';
import { SnippetCodeEditorShortcuts } from './snippet-code-editor-shortcuts';

const LazySnippetCodeDialog = React.lazy(async () => {
    const module = await import('./snippet-code-dialog');
    return { default: module.SnippetCodeDialog };
});

type SnippetCodeBlockProps = {
    snippet: Pick<ApiSuccess<FindOneSnippetDtoType['output']>, 'id' | 'language' | 'code' | 'name'>;
    readOnly?: boolean;
    onChange?: (code: string) => void;
};

export function SnippetCodeBlock({ snippet, readOnly = true, onChange }: SnippetCodeBlockProps) {
    const {
        state: { theme: appTheme },
    } = useTheme();
    const {
        state: {
            settings: { codeEditor: globalEditorSettings },
        },
    } = useDeveloperSettings();
    const [systemPrefersDark, setSystemPrefersDark] = React.useState(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
    const [code, setCode] = React.useState(snippet.code);
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
    const [localEditorSettings, setLocalEditorSettings] = React.useState<Partial<CodeEditorSettings>>({});
    const editorSettings = { ...globalEditorSettings, ...localEditorSettings };
    const isDarkMode = appTheme === 'dark' || (appTheme === 'system' && systemPrefersDark);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const updateSystemTheme = () => setSystemPrefersDark(mediaQuery.matches);

        mediaQuery.addEventListener('change', updateSystemTheme);
        return () => mediaQuery.removeEventListener('change', updateSystemTheme);
    }, []);

    React.useEffect(() => {
        setCode(snippet.code);
    }, [snippet.code]);

    React.useEffect(() => {
        setLocalEditorSettings({});
    }, [snippet.id]);

    const handleCodeChange = React.useCallback(
        (updatedCode: string) => {
            setCode(updatedCode);
            onChange?.(updatedCode);
        },
        [onChange],
    );

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-lg">Code</CardTitle>
                    <CopyButton code={code} />
                </div>
            </CardHeader>
            <CardContent className="p-2">
                <div className="bg-muted/50 overflow-hidden rounded-lg border">
                    <div className="flex items-center justify-between border-b bg-muted px-4 py-2">
                        <span className="text-sm font-mono text-muted-foreground">
                            {snippet.name.toLowerCase().replace(/\s+/g, '-')}.{snippet.language}
                        </span>
                        <div className="flex items-center gap-2">
                            <SnippetCodeEditorSettings
                                settings={editorSettings}
                                hasLocalOverrides={Object.keys(localEditorSettings).length > 0}
                                onChange={settings =>
                                    setLocalEditorSettings((previous: any) => ({ ...previous, ...settings }))
                                }
                                onReset={() => setLocalEditorSettings({})}
                            />
                            <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                aria-label="Open fullscreen code editor"
                                onClick={() => setIsDialogOpen(true)}
                            >
                                <Maximize2Icon />
                            </Button>
                        </div>
                    </div>
                    <SnippetCodeEditor
                        className="h-96"
                        code={code}
                        language={snippet.language ?? 'plaintext'}
                        readOnly={readOnly}
                        isDarkMode={isDarkMode}
                        settingsOverride={localEditorSettings}
                        onChange={handleCodeChange}
                    />
                    <SnippetCodeEditorShortcuts />
                </div>
                {isDialogOpen && (
                    <React.Suspense fallback={null}>
                        <LazySnippetCodeDialog
                            open={isDialogOpen}
                            onOpenChange={setIsDialogOpen}
                            name={snippet.name}
                            language={snippet.language ?? 'plaintext'}
                            code={code}
                            readOnly={readOnly}
                            isDarkMode={isDarkMode}
                            settings={editorSettings}
                            hasLocalOverrides={Object.keys(localEditorSettings).length > 0}
                            settingsOverride={localEditorSettings}
                            onSettingsChange={settings =>
                                setLocalEditorSettings((previous: any) => ({ ...previous, ...settings }))
                            }
                            onResetSettings={() => setLocalEditorSettings({})}
                            onChange={handleCodeChange}
                        />
                    </React.Suspense>
                )}
            </CardContent>
        </Card>
    );
}
