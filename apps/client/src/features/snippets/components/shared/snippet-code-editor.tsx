import { indentWithTab } from '@codemirror/commands';
import { LanguageDescription } from '@codemirror/language';
import { languages } from '@codemirror/language-data';
import { Compartment, EditorState } from '@codemirror/state';
import { oneDark } from '@codemirror/theme-one-dark';
import { EditorView, keymap } from '@codemirror/view';
import { basicSetup } from 'codemirror';
import React from 'react';
import { toast } from 'sonner';
import { ayuLight, dracula } from 'thememirror';

export type EditorTheme = 'system' | 'ayu-light' | 'one-dark' | 'dracula';

type SnippetCodeEditorProps = {
    code: string;
    language: string;
    readOnly: boolean;
    theme: EditorTheme;
    isDarkMode: boolean;
    onChange: (code: string) => void;
    className?: string;
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

const editorBaseTheme = EditorView.theme({
    '&': {
        fontSize: '0.875rem',
        height: '100%',
    },
    '.cm-content': {
        padding: '1rem 0',
    },
    '.cm-line': {
        padding: '0 1rem',
    },
    '.cm-scroller': {
        fontFamily: 'var(--font-geist-mono, ui-monospace, monospace)',
        height: '100%',
        overflow: 'auto',
    },
});

function themeExtension(theme: EditorTheme, isDarkMode: boolean) {
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
    return [editorBaseTheme, selectedTheme];
}

function languageName(language: string) {
    const normalizedLanguage = language.toLowerCase();
    return languageAliases[normalizedLanguage] ?? normalizedLanguage;
}

export function SnippetCodeEditor({
    code,
    language,
    readOnly,
    theme,
    isDarkMode,
    onChange,
    className,
}: SnippetCodeEditorProps) {
    const editorHostRef = React.useRef<HTMLDivElement | null>(null);
    const editorRef = React.useRef<EditorView | null>(null);
    const onChangeRef = React.useRef(onChange);
    const readOnlyRef = React.useRef(readOnly);
    const themeRef = React.useRef(theme);
    const isDarkModeRef = React.useRef(isDarkMode);
    const initialCodeRef = React.useRef(code);
    const languageRef = React.useRef(language);
    const externalUpdateRef = React.useRef(false);
    const themeCompartment = React.useMemo(() => new Compartment(), []);
    const readOnlyCompartment = React.useMemo(() => new Compartment(), []);
    const languageCompartment = React.useMemo(() => new Compartment(), []);

    onChangeRef.current = onChange;
    readOnlyRef.current = readOnly;
    themeRef.current = theme;
    isDarkModeRef.current = isDarkMode;
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
                                    .then(({ formatSnippetCode }) => formatSnippetCode(originalCode, editorLanguage))
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
                    themeCompartment.of(themeExtension(themeRef.current, isDarkModeRef.current)),
                    languageCompartment.of([]),
                ],
            }),
            parent: editorHost,
        });

        editorRef.current = editor;
        return () => {
            editor.destroy();
            editorRef.current = null;
        };
    }, [languageCompartment, readOnlyCompartment, themeCompartment]);

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
            effects: themeCompartment.reconfigure(themeExtension(theme, isDarkMode)),
        });
    }, [isDarkMode, theme, themeCompartment]);

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

    return <div ref={editorHostRef} className={className} />;
}
