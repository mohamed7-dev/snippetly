import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogHeader,
    AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { CodeEditorSettingsOverlay } from '@/features/developer-settings/components/shared/code-editor-settings-overlay';
import type { CodeEditorSettings } from '@/features/developer-settings/providers/developer-settings-provider';
import { XIcon } from 'lucide-react';
import { CopyButton } from './copy-button';
import { SnippetCodeEditor } from './snippet-code-editor';
import { SnippetCodeEditorShortcuts } from './snippet-code-editor-shortcuts';

type SnippetCodeDialogProps = {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    name: string;
    language: string;
    code: string;
    readOnly: boolean;
    isDarkMode: boolean;
    settings: CodeEditorSettings;
    hasLocalOverrides: boolean;
    settingsOverride: Partial<CodeEditorSettings>;
    onSettingsChange: (settings: Partial<CodeEditorSettings>) => void;
    onResetSettings: () => void;
    onChange: (code: string) => void;
};

export function SnippetCodeDialog({
    open,
    onOpenChange,
    name,
    language,
    code,
    readOnly,
    isDarkMode,
    settings,
    hasLocalOverrides,
    settingsOverride,
    onSettingsChange,
    onResetSettings,
    onChange,
}: SnippetCodeDialogProps) {
    return (
        <AlertDialog open={open} onOpenChange={onOpenChange}>
            <AlertDialogContent
                overlayClassName="bg-black/30 backdrop-blur-sm"
                className="flex h-[calc(100dvh-2rem)] w-[calc(100vw-2rem)] max-w-none flex-col gap-4 overflow-hidden p-4 sm:max-w-none sm:p-6"
            >
                <AlertDialogHeader className="flex-row items-center justify-between space-y-0">
                    <AlertDialogTitle className="truncate font-mono text-sm font-normal text-muted-foreground">
                        {name.toLowerCase().replace(/\s+/g, '-')}.{language}
                    </AlertDialogTitle>
                    <div className="flex items-center gap-2">
                        <CodeEditorSettingsOverlay
                            settings={settings}
                            hasLocalOverrides={hasLocalOverrides}
                            onChange={onSettingsChange}
                            onReset={onResetSettings}
                            triggerVariant="outline"
                        />
                        <CopyButton code={code} variant="outline" size="sm" />
                        <AlertDialogCancel asChild>
                            <Button variant="ghost" size="icon" aria-label="Close fullscreen editor">
                                <XIcon />
                            </Button>
                        </AlertDialogCancel>
                    </div>
                </AlertDialogHeader>
                <div className="min-h-0 flex-1 overflow-hidden rounded-lg border">
                    <SnippetCodeEditor
                        className="h-full"
                        code={code}
                        language={language}
                        readOnly={readOnly}
                        isDarkMode={isDarkMode}
                        settingsOverride={settingsOverride}
                        onChange={onChange}
                    />
                </div>
                <SnippetCodeEditorShortcuts />
            </AlertDialogContent>
        </AlertDialog>
    );
}
