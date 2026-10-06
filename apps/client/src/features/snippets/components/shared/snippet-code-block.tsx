import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useTheme } from '@/hooks/use-theme';
import type { ApiSuccess } from '@/lib/api-client';
import type { FindOneSnippetDtoType } from '@snippetly/common/dto';
import { Maximize2Icon } from 'lucide-react';
import React from 'react';
import { CopyButton } from './copy-button';
import { SnippetCodeEditor, type EditorTheme } from './snippet-code-editor';

const LazySnippetCodeDialog = React.lazy(async () => {
    const module = await import('./snippet-code-dialog');
    return { default: module.SnippetCodeDialog };
});

type SnippetCodeBlockProps = {
    snippet: Pick<ApiSuccess<FindOneSnippetDtoType['output']>, 'id' | 'language' | 'code' | 'name'>;
    readOnly?: boolean;
    onChange?: (code: string) => void;
};

function isEditorTheme(value: string): value is EditorTheme {
    return value === 'system' || value === 'ayu-light' || value === 'one-dark' || value === 'dracula';
}

export function SnippetCodeBlock({ snippet, readOnly = true, onChange }: SnippetCodeBlockProps) {
    const { theme: appTheme } = useTheme();
    const [systemPrefersDark, setSystemPrefersDark] = React.useState(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
    const [code, setCode] = React.useState(snippet.code);
    const [theme, setTheme] = React.useState<EditorTheme>('system');
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);
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
                            <Select
                                value={theme}
                                onValueChange={value => {
                                    if (isEditorTheme(value)) setTheme(value);
                                }}
                            >
                                <SelectTrigger aria-label="Editor theme" className="h-8 w-32">
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="system">System</SelectItem>
                                    <SelectItem value="ayu-light">Ayu Light</SelectItem>
                                    <SelectItem value="one-dark">One Dark</SelectItem>
                                    <SelectItem value="dracula">Dracula</SelectItem>
                                </SelectContent>
                            </Select>
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
                        theme={theme}
                        isDarkMode={isDarkMode}
                        onChange={handleCodeChange}
                    />
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
                            theme={theme}
                            isDarkMode={isDarkMode}
                            onChange={handleCodeChange}
                        />
                    </React.Suspense>
                )}
            </CardContent>
        </Card>
    );
}
