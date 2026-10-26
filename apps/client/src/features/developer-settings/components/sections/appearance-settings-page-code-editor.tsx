import { ProcessStatus } from '@/components/feedback/process-status';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { SnippetCodeEditor } from '@/features/snippets/components/shared/snippet-code-editor';
import { useTheme } from '@/hooks/use-theme';
import { Code2Icon } from 'lucide-react';
import { useDeveloperSettings } from '../../hooks/use-developer-settings';
import type { CodeEditorSettings, CodeEditorTheme } from '../../providers/developer-settings-provider';

const EDITOR_THEMES = [
    { value: 'system', label: 'System (follows appearance)' },
    { value: 'ayu-light', label: 'Ayu Light' },
    { value: 'one-dark', label: 'One Dark' },
    { value: 'dracula', label: 'Dracula' },
] as const;
const EDITOR_FONT_FAMILIES = [
    { value: 'geist-mono', label: 'Geist Mono' },
    { value: 'system-mono', label: 'System Monospace' },
] as const;
const EDITOR_FONT_SIZES = [10, 12, 14, 16, 18, 20, 24] as const;
const EDITOR_TAB_SIZES = [2, 4, 8] as const;

function isCodeEditorTheme(value: string): value is CodeEditorTheme {
    return EDITOR_THEMES.some(option => option.value === value);
}

function isCodeEditorFontFamily(value: string): value is CodeEditorSettings['fontFamily'] {
    return EDITOR_FONT_FAMILIES.some(option => option.value === value);
}

export function AppearanceSettingsPageCodeEditor() {
    const {
        state: {
            settings: { codeEditor },
        },
        actions: { updateCodeEditorSettings },
    } = useDeveloperSettings();
    const {
        state: { theme, systemPrefersDark },
    } = useTheme();

    const isDarkMode = theme === 'dark' || (theme === 'system' && systemPrefersDark);

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Code2Icon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h2>Code editor</h2>
                </CardTitle>
                <CardDescription>
                    <p>Choose the syntax theme, font, size, and indentation used in code editors.</p>
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4 grid-cols-1 md:grid-cols-2">
                <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="editor-theme">Syntax theme</Label>
                    <Select
                        value={codeEditor.theme}
                        onValueChange={value => {
                            if (isCodeEditorTheme(value)) updateCodeEditorSettings({ theme: value });
                        }}
                    >
                        <SelectTrigger id="editor-theme" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EDITOR_THEMES.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="editor-font-size">Font size</Label>
                    <Select
                        value={String(codeEditor.fontSize)}
                        onValueChange={value => {
                            const fontSize = Number(value);
                            if (EDITOR_FONT_SIZES.some(size => size === fontSize)) {
                                updateCodeEditorSettings({ fontSize });
                            }
                        }}
                    >
                        <SelectTrigger id="editor-font-size" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EDITOR_FONT_SIZES.map(size => (
                                <SelectItem key={size} value={String(size)}>
                                    {size}px
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="editor-font-family">Font family</Label>
                    <Select
                        value={codeEditor.fontFamily}
                        onValueChange={value => {
                            if (isCodeEditorFontFamily(value)) {
                                updateCodeEditorSettings({ fontFamily: value });
                            }
                        }}
                    >
                        <SelectTrigger id="editor-font-family" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EDITOR_FONT_FAMILIES.map(option => (
                                <SelectItem key={option.value} value={option.value}>
                                    {option.label}
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="space-y-2 col-span-2 md:col-span-1">
                    <Label htmlFor="editor-tab-size">Indent size</Label>
                    <Select
                        value={String(codeEditor.tabSize)}
                        onValueChange={value => {
                            const tabSize = Number(value);
                            if (EDITOR_TAB_SIZES.some(size => size === tabSize)) {
                                updateCodeEditorSettings({ tabSize });
                            }
                        }}
                    >
                        <SelectTrigger id="editor-tab-size" className="w-full">
                            <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                            {EDITOR_TAB_SIZES.map(size => (
                                <SelectItem key={size} value={String(size)}>
                                    {size} spaces
                                </SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                </div>
                <div className="flex items-center justify-between rounded-md border p-3 col-span-2 w-full">
                    <Label htmlFor="editor-line-numbers">Line numbers</Label>
                    <Switch
                        id="editor-line-numbers"
                        checked={codeEditor.lineNumbers}
                        onCheckedChange={lineNumbers => updateCodeEditorSettings({ lineNumbers })}
                    />
                </div>
                <div className="flex items-center justify-between rounded-md border p-3 col-span-2 w-full">
                    <Label htmlFor="editor-line-wrapping">Wrap long lines</Label>
                    <Switch
                        id="editor-line-wrapping"
                        checked={codeEditor.lineWrapping}
                        onCheckedChange={lineWrapping => updateCodeEditorSettings({ lineWrapping })}
                    />
                </div>
                <ProcessStatus
                    variant={'info'}
                    title={'Info'}
                    description={
                        'The live editor preview responds to light and dark appearance. Its syntax colors follow that mode when the syntax theme is set to System; fixed syntax themes override it.'
                    }
                    showCloseButton={false}
                    className="col-span-2 w-full"
                />
                <div className="overflow-hidden rounded-lg border col-span-2 w-full">
                    <div className="border-b bg-muted px-4 py-2 text-sm font-mono text-muted-foreground">
                        hello-world.ts
                    </div>
                    <SnippetCodeEditor
                        className="h-64"
                        code={`function greet(name: string) {
    console.log(\`Hello, \${name}!\`);
}

greet('Snippetly');`}
                        language="typescript"
                        readOnly={true}
                        isDarkMode={isDarkMode}
                        onChange={() => undefined}
                    />
                </div>
            </CardContent>
        </Card>
    );
}
