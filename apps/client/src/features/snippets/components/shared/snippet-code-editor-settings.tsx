import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import type {
    CodeEditorSettings,
    CodeEditorTheme,
} from '@/features/developer-settings/providers/developer-settings-provider';
import { Settings2Icon } from 'lucide-react';
import React, { type ComponentProps } from 'react';

const EDITOR_THEMES = [
    { value: 'system', label: 'System (follows appearance)' },
    { value: 'ayu-light', label: 'Ayu Light' },
    { value: 'one-dark', label: 'One Dark' },
    { value: 'dracula', label: 'Dracula' },
] as const;
const FONT_FAMILIES = [
    { value: 'geist-mono', label: 'Geist Mono' },
    { value: 'system-mono', label: 'System Monospace' },
] as const;
const FONT_SIZES = [10, 12, 14, 16, 18, 20, 24] as const;
const TAB_SIZES = [2, 4, 8] as const;

function isEditorTheme(value: string): value is CodeEditorTheme {
    return EDITOR_THEMES.some(option => option.value === value);
}

function isFontFamily(value: string): value is CodeEditorSettings['fontFamily'] {
    return FONT_FAMILIES.some(option => option.value === value);
}

type SnippetCodeEditorSettingsProps = {
    settings: CodeEditorSettings;
    hasLocalOverrides: boolean;
    onChange: (settings: Partial<CodeEditorSettings>) => void;
    triggerVariant?: ComponentProps<typeof Button>['variant'];
    onReset: () => void;
};

export function SnippetCodeEditorSettings({
    settings,
    hasLocalOverrides,
    onChange,
    triggerVariant = 'ghost',
    onReset,
}: SnippetCodeEditorSettingsProps) {
    const id = React.useId();

    return (
        <Popover>
            <PopoverTrigger asChild>
                <Button
                    type="button"
                    variant={triggerVariant}
                    size="icon"
                    aria-label="Customize editor for this snippet"
                    title="Customize editor for this snippet"
                >
                    <Settings2Icon />
                </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-80 space-y-4">
                <div>
                    <h3 className="font-medium">Editor settings</h3>
                    <p className="text-xs text-muted-foreground">
                        These changes apply only to this snippet and are not saved.
                    </p>
                </div>
                <div className="space-y-3">
                    <div className="space-y-1.5">
                        <Label htmlFor={`${id}-theme`}>Syntax theme</Label>
                        <Select
                            value={settings.theme}
                            onValueChange={value => {
                                if (isEditorTheme(value)) onChange({ theme: value });
                            }}
                        >
                            <SelectTrigger id={`${id}-theme`}>
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
                    <div className="grid grid-cols-2 gap-3">
                        <div className="space-y-1.5">
                            <Label htmlFor={`${id}-font-size`}>Font size</Label>
                            <Select
                                value={String(settings.fontSize)}
                                onValueChange={value => {
                                    const fontSize = Number(value);
                                    if (FONT_SIZES.some(size => size === fontSize)) onChange({ fontSize });
                                }}
                            >
                                <SelectTrigger id={`${id}-font-size`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FONT_SIZES.map(size => (
                                        <SelectItem key={size} value={String(size)}>
                                            {size}px
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor={`${id}-font-family`}>Font family</Label>
                            <Select
                                value={settings.fontFamily}
                                onValueChange={value => {
                                    if (isFontFamily(value)) onChange({ fontFamily: value });
                                }}
                            >
                                <SelectTrigger id={`${id}-font-family`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {FONT_FAMILIES.map(option => (
                                        <SelectItem key={option.value} value={option.value}>
                                            {option.label}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-1.5">
                            <Label htmlFor={`${id}-tab-size`}>Indent size</Label>
                            <Select
                                value={String(settings.tabSize)}
                                onValueChange={value => {
                                    const tabSize = Number(value);
                                    if (TAB_SIZES.some(size => size === tabSize)) onChange({ tabSize });
                                }}
                            >
                                <SelectTrigger id={`${id}-tab-size`}>
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {TAB_SIZES.map(size => (
                                        <SelectItem key={size} value={String(size)}>
                                            {size} spaces
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor={`${id}-line-numbers`}>Line numbers</Label>
                        <Switch
                            id={`${id}-line-numbers`}
                            checked={settings.lineNumbers}
                            onCheckedChange={lineNumbers => onChange({ lineNumbers })}
                        />
                    </div>
                    <div className="flex items-center justify-between">
                        <Label htmlFor={`${id}-line-wrapping`}>Wrap long lines</Label>
                        <Switch
                            id={`${id}-line-wrapping`}
                            checked={settings.lineWrapping}
                            onCheckedChange={lineWrapping => onChange({ lineWrapping })}
                        />
                    </div>
                </div>
                <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="w-full"
                    disabled={!hasLocalOverrides}
                    onClick={onReset}
                >
                    Reset to global settings
                </Button>
            </PopoverContent>
        </Popover>
    );
}
