import { Alert, AlertDescription } from '@/components/ui/alert';
import { useDeveloperSettings } from '@/features/developer-settings/hooks/use-developer-settings';
import type {
    CodeEditorSettings,
    CodeEditorTheme,
} from '@/features/developer-settings/providers/developer-settings-provider';
import { indentWithTab } from '@codemirror/commands';
import { indentUnit, LanguageDescription } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { Compartment, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import { InfoIcon } from 'lucide-react';
import React from 'react';
import { toast } from 'sonner';
import { ayuLight, dracula } from 'thememirror';

type SnippetCodeEditorProps = {
    code: string;
    language: string;
    readOnly: boolean;
    isDarkMode: boolean;
    onChange: (code: string) => void;
    className?: string;
    settingsOverride?: Partial<CodeEditorSettings>;
};

const languageAliases: Record<string, string> = {
    csharp: 'c#',
    cpp: 'c++',
    js: 'javascript',
    jsx: 'javascript',
    md: 'markdown',
    py: 'python',
    sh: 'shell',
    ts: 'typescript',
    tsx: 'tsx',
    yml: 'yaml',
};

function editorBaseTheme(fontSize: number, fontFamily: 'geist-mono' | 'system-mono', lineNumbers: boolean) {
    return EditorView.theme({
        '&': {
            fontSize: `${fontSize}px`,
            height: '100%',
            width: '100%',
            minWidth: '0',
            maxWidth: '100%',
        },
        '.cm-gutters': {
            display: lineNumbers ? 'block' : 'none',
        },
        '.cm-content': {
            padding: '1rem 0',
        },
        '.cm-line': {
            padding: '0 1rem',
        },
        '.cm-scroller': {
            fontFamily:
                fontFamily === 'geist-mono'
                    ? 'var(--font-geist-mono, ui-monospace, monospace)'
                    : 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
            height: '100%',
            width: '100%',
            minWidth: '0',
            overflowX: 'auto',
            overflowY: 'auto',
        },
    });
}

function themeExtension(
    theme: CodeEditorTheme,
    isDarkMode: boolean,
    fontSize: number,
    fontFamily: 'geist-mono' | 'system-mono',
    lineNumbers: boolean,
) {
    const selectedTheme =
        theme === 'system'
            ? isDarkMode
                ? oneDark
                : ayuLight
            : theme === 'ayu-light'
              ? ayuLight
              : theme === 'one-dark'
                ? oneDark
                : dracula;
    return [editorBaseTheme(fontSize, fontFamily, lineNumbers), selectedTheme];
}

function tabSizeExtension(tabSize: number) {
    return [EditorState.tabSize.of(tabSize), indentUnit.of(' '.repeat(tabSize))];
}

function languageName(language: string) {
    const normalizedLanguage = language.toLowerCase();
    return languageAliases[normalizedLanguage] ?? normalizedLanguage;
}

export function SnippetCodeEditor({
    code,
    language,
    readOnly,
    isDarkMode,
    onChange,
    className,
    settingsOverride,
}: SnippetCodeEditorProps) {
    const {
        state: {
            settings: { codeEditor },
        },
    } = useDeveloperSettings();
    const { theme, fontSize, fontFamily, tabSize, lineWrapping, lineNumbers } = {
        ...codeEditor,
        ...settingsOverride,
    };
    const editorHostRef = React.useRef<HTMLDivElement | null>(null);
    const editorRef = React.useRef<EditorView | null>(null);
    const onChangeRef = React.useRef(onChange);
    const readOnlyRef = React.useRef(readOnly);
    const themeRef = React.useRef(theme);
    const isDarkModeRef = React.useRef(isDarkMode);
    const editorSettingsRef = React.useRef({ fontSize, fontFamily, tabSize, lineWrapping, lineNumbers });
    const initialCodeRef = React.useRef(code);
    const languageRef = React.useRef(language);
    const externalUpdateRef = React.useRef(false);
    const themeCompartment = React.useMemo(() => new Compartment(), []);
    const readOnlyCompartment = React.useMemo(() => new Compartment(), []);
    const languageCompartment = React.useMemo(() => new Compartment(), []);
    const wrappingCompartment = React.useMemo(() => new Compartment(), []);
    const tabSizeCompartment = React.useMemo(() => new Compartment(), []);

    onChangeRef.current = onChange;
    readOnlyRef.current = readOnly;
    themeRef.current = theme;
    isDarkModeRef.current = isDarkMode;
    editorSettingsRef.current = { fontSize, fontFamily, tabSize, lineWrapping, lineNumbers };
    initialCodeRef.current = code;
    languageRef.current = language;

    React.useEffect(() => {
        const editorHost = editorHostRef.current;
        if (!editorHost) return;

        const editor = new EditorView({
            state: EditorState.create({
                doc: initialCodeRef.current,
                extensions: [
                    basicSetup,
                    keymap.of([
                        indentWithTab,
                        {
                            key: 'Mod-Shift-f',
                            run: view => {
                                if (readOnlyRef.current) return false;

                                const originalCode = view.state.doc.toString();
                                const editorLanguage = languageRef.current;
                                void import('./format-snippet-code')
                                    .then(({ formatSnippetCode }) =>
                                        formatSnippetCode(originalCode, editorLanguage),
                                    )
                                    .then(formattedCode => {
                                        if (view.state.doc.toString() !== originalCode) {
                                            toast.error('Code changed while formatting', {
                                                description:
                                                    'Run the formatter again to format the latest changes.',
                                            });
                                            return;
                                        }

                                        if (formattedCode === originalCode) return;
                                        const selection = view.state.selection.main;
                                        view.dispatch({
                                            changes: {
                                                from: 0,
                                                to: originalCode.length,
                                                insert: formattedCode,
                                            },
                                            selection: {
                                                anchor: Math.min(selection.anchor, formattedCode.length),
                                                head: Math.min(selection.head, formattedCode.length),
                                            },
                                        });
                                    })
                                    .catch(error => {
                                        toast.error('Unable to format code', {
                                            description:
                                                error instanceof Error
                                                    ? error.message
                                                    : 'An unexpected formatter error occurred.',
                                        });
                                    });
                                return true;
                            },
                        },
                    ]),
                    EditorView.updateListener.of(update => {
                        if (update.docChanged && !externalUpdateRef.current) {
                            onChangeRef.current(update.state.doc.toString());
                        }
                    }),
                    readOnlyCompartment.of([
                        EditorState.readOnly.of(readOnlyRef.current),
                        EditorView.editable.of(!readOnlyRef.current),
                    ]),
                    themeCompartment.of(
                        themeExtension(
                            themeRef.current,
                            isDarkModeRef.current,
                            editorSettingsRef.current.fontSize,
                            editorSettingsRef.current.fontFamily,
                            editorSettingsRef.current.lineNumbers,
                        ),
                    ),
                    languageCompartment.of([]),
                    wrappingCompartment.of(
                        editorSettingsRef.current.lineWrapping ? EditorView.lineWrapping : [],
                    ),
                    tabSizeCompartment.of(tabSizeExtension(editorSettingsRef.current.tabSize)),
                ],
            }),
            parent: editorHost,
        });

        editorRef.current = editor;
        return () => {
            editor.destroy();
            editorRef.current = null;
        };
    }, [languageCompartment, readOnlyCompartment, tabSizeCompartment, themeCompartment, wrappingCompartment]);

    React.useEffect(() => {
        const editor = editorRef.current;
        if (!editor || editor.state.doc.toString() === code) return;

        externalUpdateRef.current = true;
        editor.dispatch({
            changes: {
                from: 0,
                to: editor.state.doc.length,
                insert: code,
            },
        });
        externalUpdateRef.current = false;
    }, [code]);

    React.useEffect(() => {
        editorRef.current?.dispatch({
            effects: readOnlyCompartment.reconfigure([
                EditorState.readOnly.of(readOnly),
                EditorView.editable.of(!readOnly),
            ]),
        });
    }, [readOnly, readOnlyCompartment]);

    React.useEffect(() => {
        editorRef.current?.dispatch({
            effects: themeCompartment.reconfigure(
                themeExtension(theme, isDarkMode, fontSize, fontFamily, lineNumbers),
            ),
        });
    }, [fontFamily, fontSize, isDarkMode, lineNumbers, theme, themeCompartment]);

    React.useEffect(() => {
        editorRef.current?.dispatch({
            effects: wrappingCompartment.reconfigure(lineWrapping ? EditorView.lineWrapping : []),
        });
    }, [lineWrapping, wrappingCompartment]);

    React.useEffect(() => {
        editorRef.current?.dispatch({
            effects: tabSizeCompartment.reconfigure(tabSizeExtension(tabSize)),
        });
    }, [tabSize, tabSizeCompartment]);

    React.useEffect(() => {
        const normalizedLanguage = languageName(language || 'plaintext');
        if (normalizedLanguage === 'plaintext') {
            editorRef.current?.dispatch({
                effects: languageCompartment.reconfigure([]),
            });
            return;
        }

        const description = LanguageDescription.matchLanguageName(languages, normalizedLanguage);
        if (!description) {
            editorRef.current?.dispatch({
                effects: languageCompartment.reconfigure([]),
            });
            return;
        }

        let cancelled = false;
        void description
            .load()
            .then(support => {
                if (!cancelled) {
                    editorRef.current?.dispatch({
                        effects: languageCompartment.reconfigure(support),
                    });
                }
            })
            .catch(error => {
                if (!cancelled) {
                    console.error(`Failed to load CodeMirror language "${normalizedLanguage}".`, error);
                }
            });

        return () => {
            cancelled = true;
        };
    }, [language, languageCompartment]);

    const hasLanguage = language.trim() !== '' && languageName(language) !== 'plaintext';

    return (
        <div className="w-full min-w-0 space-y-2">
            {!hasLanguage && (
                <Alert className="rounded-none border-x-0 border-t-0">
                    <InfoIcon className="h-4 w-4 text-primary" />
                    <AlertDescription>
                        Specify a language for this snippet to enable formatting and language-specific editor
                        features.
                    </AlertDescription>
                </Alert>
            )}
            <div ref={editorHostRef} className={`w-full min-w-0 ${className ?? ''}`} />
        </div>
    );
}
