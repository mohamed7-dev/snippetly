import type { Theme } from '@/components/providers/theme-provider';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { SnippetCodeEditor } from '@/features/snippets/components/shared/snippet-code-editor';
import { useTheme } from '@/hooks/use-theme';
import { APP_NAME } from '@snippetly/common/lib';
import { THEME_OPTIONS } from '../../lib/data';

export function AppearanceSettingsPageThemeSettings() {
    const { theme, setTheme } = useTheme();
    return (
        <Card>
            <CardHeader>
                <CardTitle>Theme</CardTitle>
                <CardDescription>
                    Choose how {APP_NAME} looks to you. Select a single theme, or sync with your system and
                    automatically switch between day and night themes.
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <div className="grid grid-cols-1 gap-4">
                    {THEME_OPTIONS.map(option => {
                        const Icon = option.icon;
                        const isSelected = theme === option.value;

                        return (
                            <div
                                key={option.value}
                                className={`relative cursor-pointer rounded-lg border-2 p-4 transition-all hover:bg-muted/50 ${
                                    isSelected ? 'border-primary bg-primary/5' : 'border-border'
                                }`}
                                onClick={() => setTheme(option.value)}
                            >
                                <div className="flex items-start gap-4">
                                    <div
                                        className={`w-16 h-12 rounded-md border-2 ${option.preview} shrink-0`}
                                    >
                                        <div className="w-full h-full rounded-sm flex items-center justify-center">
                                            <Icon className="h-4 w-4 text-gray-600" />
                                        </div>
                                    </div>

                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <Label className="text-base font-medium cursor-pointer">
                                                {option.label}
                                            </Label>
                                            {isSelected && (
                                                <div className="w-2 h-2 rounded-full bg-primary"></div>
                                            )}
                                        </div>
                                        <p className="text-sm text-muted-foreground mt-1">
                                            {option.description}
                                        </p>
                                    </div>

                                    <div
                                        className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${
                                            isSelected
                                                ? 'border-primary bg-primary'
                                                : 'border-muted-foreground'
                                        }`}
                                    >
                                        {isSelected && (
                                            <div className="w-2 h-2 rounded-full bg-primary-foreground"></div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>

                <ThemePreview theme={theme} />
            </CardContent>
        </Card>
    );
}

function ThemePreview({ theme }: { theme: Theme }) {
    return (
        <div className="space-y-3">
            <Label className="text-sm font-medium">Preview</Label>
            <div className="rounded-lg border p-4 space-y-3">
                <div className="flex items-center justify-between">
                    <h3 className="font-semibold">Code Snippet Preview</h3>
                </div>
                <SnippetCodeEditor
                    code={`
function sayHello (username:string) {
    console.log('Hello, username!')
}
                        `}
                    language="typescript"
                    readOnly={true}
                    theme={theme === 'light' ? 'ayu-light' : theme === 'dark' ? 'one-dark' : 'system'}
                    onChange={() => undefined}
                    isDarkMode={true}
                />
            </div>
        </div>
    );
}
