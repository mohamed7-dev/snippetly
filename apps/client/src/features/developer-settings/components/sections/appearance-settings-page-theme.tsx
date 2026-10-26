import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useTheme } from '@/hooks/use-theme';
import { PaletteIcon } from 'lucide-react';
import { COLOR_SCHEME_OPTIONS, THEME_OPTIONS } from '../../lib/data';

export function AppearanceSettingsPageThemeSettings() {
    const {
        state: { theme, colorScheme },
        actions: { setTheme, setColorScheme },
    } = useTheme();

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <PaletteIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h2>Theme</h2>
                </CardTitle>
                <CardDescription>
                    <p>Choose a color style and decide whether to use light, dark, or system appearance.</p>
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
            </CardContent>
        </Card>
    );
}
