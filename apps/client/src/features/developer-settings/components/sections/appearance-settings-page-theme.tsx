import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { useDeveloperSettings } from '@/features/developer-settings/hooks/use-developer-settings';
import type {
    CodeEditorSettings,
    CodeEditorTheme,
} from '@/features/developer-settings/providers/developer-settings-provider';
import { SnippetCodeEditor } from '@/features/snippets/components/shared/snippet-code-editor';
import { useTheme } from '@/hooks/use-theme';
import { InfoIcon } from 'lucide-react';
import React from 'react';
import { COLOR_SCHEME_OPTIONS, THEME_OPTIONS } from '../../lib/data';

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

export function AppearanceSettingsPageThemeSettings() {
    const {
        state: { theme, colorScheme },
        actions: { setTheme, setColorScheme },
    } = useTheme();
    const {
        state: {
            settings: { codeEditor },
        },
        actions: { updateCodeEditorSettings },
    } = useDeveloperSettings();
    const [systemPrefersDark, setSystemPrefersDark] = React.useState(
        () => typeof window !== 'undefined' && window.matchMedia('(prefers-color-scheme: dark)').matches,
    );
    const isDarkMode = theme === 'dark' || (theme === 'system' && systemPrefersDark);

    React.useEffect(() => {
        const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
        const updateSystemTheme = () => setSystemPrefersDark(mediaQuery.matches);

        mediaQuery.addEventListener('change', updateSystemTheme);
        return () => mediaQuery.removeEventListener('change', updateSystemTheme);
    }, []);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                    Choose a color style and decide whether to use light, dark, or system appearance.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <section className="space-y-3">
                    <h3 className="text-sm font-medium">Color style</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {COLOR_SCHEME_OPTIONS.map(option => {
                            const isSelected = colorScheme === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={isSelected}
                                    className={`min-w-0 rounded-lg border-2 p-3 text-left transition-colors hover:bg-muted/50 ${
                                        isSelected ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                                    onClick={() => setColorScheme(option.value)}
                                >
                                    <div className="mb-3 flex overflow-hidden rounded-md border border-border">
                                        {(['light', 'dark'] as const).map(mode => {
                                            const colors = option.preview[mode];

                                            return (
                                                <div
                                                    key={mode}
                                                    className="flex min-h-20 flex-1 flex-col justify-between p-2"
                                                    style={{
                                                        backgroundColor: colors.background,
                                                        color: colors.foreground,
                                                    }}
                                                >
                                                    <span className="text-[10px] font-medium capitalize">
                                                        {mode}
                                                    </span>
                                                    <div className="flex items-center gap-1.5">
                                                        <span
                                                            className="h-3 w-3 rounded-full"
                                                            style={{ backgroundColor: colors.primary }}
                                                        />
                                                        <span
                                                            className="h-1.5 w-8 rounded-full opacity-40"
                                                            style={{ backgroundColor: colors.foreground }}
                                                        />
                                                    </div>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <option.icon className="h-4 w-4 text-muted-foreground" />
                                        <span className="font-medium">{option.label}</span>
                                        {isSelected && (
                                            <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <p className="mt-1 text-xs text-muted-foreground">{option.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="space-y-3">
                    <h3 className="text-sm font-medium">Appearance mode</h3>
                    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                        {THEME_OPTIONS.map(option => {
                            const Icon = option.icon;
                            const isSelected = theme === option.value;

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    aria-pressed={isSelected}
                                    className={`rounded-lg border-2 p-3 text-left transition-all hover:bg-muted/50 ${
                                        isSelected ? 'border-primary bg-primary/5' : 'border-border'
                                    }`}
                                    onClick={() => setTheme(option.value)}
                                >
                                    <div
                                        className={`mb-3 flex h-20 w-full items-center justify-center rounded-md border-2 ${option.preview}`}
                                    >
                                        <Icon className="h-8 w-8 text-gray-600" />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-base font-medium">{option.label}</span>
                                        {isSelected && (
                                            <span className="ml-auto h-2 w-2 rounded-full bg-primary" />
                                        )}
                                    </div>
                                    <p className="mt-1 text-sm text-muted-foreground">{option.description}</p>
                                </button>
                            );
                        })}
                    </div>
                </section>

                <section className="space-y-4">
                    <div>
                        <h3 className="text-sm font-medium">Code editor</h3>
                        <p className="mt-1 text-sm text-muted-foreground">
                            Customize the editor used throughout Snippetly.
                        </p>
                    </div>
                    <div className="grid gap-4 sm:grid-cols-2">
                        <div className="space-y-2">
                            <Label htmlFor="editor-theme">Syntax theme</Label>
                            <Select
                                value={codeEditor.theme}
                                onValueChange={value => {
                                    if (isCodeEditorTheme(value)) updateCodeEditorSettings({ theme: value });
                                }}
                            >
                                <SelectTrigger id="editor-theme">
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
                        <div className="space-y-2">
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
                                <SelectTrigger id="editor-font-size">
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
                        <div className="space-y-2">
                            <Label htmlFor="editor-font-family">Font family</Label>
                            <Select
                                value={codeEditor.fontFamily}
                                onValueChange={value => {
                                    if (isCodeEditorFontFamily(value)) {
                                        updateCodeEditorSettings({ fontFamily: value });
                                    }
                                }}
                            >
                                <SelectTrigger id="editor-font-family">
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
                        <div className="space-y-2">
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
                                <SelectTrigger id="editor-tab-size">
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
                        <div className="flex items-center justify-between rounded-md border p-3">
                            <Label htmlFor="editor-line-numbers">Line numbers</Label>
                            <Switch
                                id="editor-line-numbers"
                                checked={codeEditor.lineNumbers}
                                onCheckedChange={lineNumbers => updateCodeEditorSettings({ lineNumbers })}
                            />
                        </div>
                        <div className="flex items-center justify-between rounded-md border p-3 sm:col-span-2">
                            <Label htmlFor="editor-line-wrapping">Wrap long lines</Label>
                            <Switch
                                id="editor-line-wrapping"
                                checked={codeEditor.lineWrapping}
                                onCheckedChange={lineWrapping => updateCodeEditorSettings({ lineWrapping })}
                            />
                        </div>
                    </div>
                    <Alert className="border-primary/50">
                        <InfoIcon className="h-4 w-4 text-primary" />
                        <AlertDescription>
                            The live editor preview responds to light and dark appearance. Its syntax colors
                            follow that mode when the syntax theme is set to System; fixed syntax themes
                            override it.
                        </AlertDescription>
                    </Alert>
                    <div className="overflow-hidden rounded-lg border">
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
                </section>
            </CardContent>
        </Card>
    );
}
