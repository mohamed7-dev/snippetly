const EDITOR_SHORTCUTS = [
    { action: 'Format code', shortcut: 'Ctrl / Cmd + Shift + F' },
    { action: 'Indent selection or line', shortcut: 'Tab' },
    { action: 'Decrease indentation', shortcut: 'Shift + Tab' },
    { action: 'Find in code', shortcut: 'Ctrl / Cmd + F' },
    { action: 'Undo', shortcut: 'Ctrl / Cmd + Z' },
    { action: 'Redo', shortcut: 'Ctrl / Cmd + Shift + Z' },
] as const;

export function SnippetCodeEditorShortcuts() {
    return (
        <details className="border-t bg-background/50 px-4 py-2 text-sm">
            <summary className="w-fit cursor-pointer font-medium text-muted-foreground">
                Editor keyboard shortcuts
            </summary>
            <dl className="mt-3 grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
                {EDITOR_SHORTCUTS.map(({ action, shortcut }) => (
                    <div key={action} className="flex items-center justify-between gap-3">
                        <dt>{action}</dt>
                        <dd>
                            <kbd className="rounded border bg-muted px-1.5 py-0.5 font-mono text-xs">
                                {shortcut}
                            </kbd>
                        </dd>
                    </div>
                ))}
            </dl>
        </details>
    );
}
