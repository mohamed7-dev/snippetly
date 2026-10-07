import { cn } from '@/lib/utils';
import Placeholder from '@tiptap/extension-placeholder';
import { TextStyle } from '@tiptap/extension-text-style';
import { Editor, EditorContent, useEditor } from '@tiptap/react';
import StarterKit from '@tiptap/starter-kit';
import { useCallback, useLayoutEffect, useMemo } from 'react';
import { Toolbar } from './toolbar';

interface RichTextEditorProps {
    value: string;
    isDisabled?: boolean;
    onValueChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextEditor({
    value,
    isDisabled = false,
    onValueChange,
    placeholder,
}: RichTextEditorProps) {
    const handleValueChange = useCallback(
        (editor: Editor) => {
            if (isDisabled || editor.isDestroyed) return;
            const currentValue = editor.getHTML();
            const wasValueChanged = currentValue !== value;
            if (wasValueChanged) {
                onValueChange?.(currentValue);
            }
        },
        [value, onValueChange, isDisabled],
    );

    const editorExtensions = useMemo(() => {
        const baseExtensions = [
            StarterKit.configure({
                orderedList: { keepMarks: true, keepAttributes: false },
                bulletList: { keepMarks: true, keepAttributes: false },
                link: {
                    openOnClick: false,
                    validate: href => /^https?:\/\//.test(href),
                    HTMLAttributes: {
                        class: 'text-primary underline underline-offset-2 cursor-pointer hover:text-primary/80',
                    },
                },
            }),
            TextStyle.configure(),
        ];

        return placeholder ? [...baseExtensions, Placeholder.configure({ placeholder })] : baseExtensions;
    }, [placeholder]);

    const editor = useEditor(
        {
            content: value,
            editable: !isDisabled,
            onUpdate: ({ editor }) => handleValueChange(editor),
            extensions: editorExtensions,
            parseOptions: {
                preserveWhitespace: 'full',
            },
            editorProps: {
                attributes: {
                    class: cn(
                        'rte w-full min-h-20 max-h-[500px] overflow-y-auto p-3 outline-none text-base bg-transparent placeholder:text-muted-foreground aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive focus-visible:border-ring focus-visible:ring-ring/10',
                        isDisabled ? 'cursor-not-allowed opacity-50' : '',
                    ),
                },
            },
        },
        [editorExtensions],
    );

    useLayoutEffect(() => {
        if (editor) {
            editor.setEditable(!isDisabled, false);
        }
    }, [isDisabled, editor]);

    if (!editor) return null;

    return (
        <div className="border overflow-hidden rounded-md">
            <Toolbar editor={editor} isDisabled={isDisabled} />
            <EditorContent editor={editor} />
            <style>{`
                .rte h1 {
                    font-size: 2em;
                    font-weight: 700;
                    margin-top: 0.67em;
                    margin-bottom: 0.67em;
                    line-height: 1.2;
                }
                .rte h2 {
                    font-size: 1.5em;
                    font-weight: 600;
                    margin-top: 0.83em;
                    margin-bottom: 0.83em;
                    line-height: 1.3;
                }
                .rte h3 {
                    font-size: 1.17em;
                    font-weight: 600;
                    margin-top: 1em;
                    margin-bottom: 1em;
                    line-height: 1.4;
                }
                .rte h4 {
                    font-size: 1em;
                    font-weight: 600;
                    margin-top: 1.33em;
                    margin-bottom: 1.33em;
                    line-height: 1.4;
                }
                .rte h5 {
                    font-size: 0.83em;
                    font-weight: 600;
                    margin-top: 1.67em;
                    margin-bottom: 1.67em;
                    line-height: 1.5;
                }
                .rte h6 {
                    font-size: 0.67em;
                    font-weight: 600;
                    margin-top: 2.33em;
                    margin-bottom: 2.33em;
                    line-height: 1.6;
                }
                .rte p {
                    margin-top: 0;
                    margin-bottom: 1em;
                    line-height: 1.6;
                }
                .rte strong,
                .rte b {
                    font-weight: 700;
                }
                .rte em,
                .rte i {
                    font-style: italic;
                }
                .rte s,
                .rte del,
                .rte strike {
                    text-decoration: line-through;
                }
                .rte ul {
                    list-style-type: disc;
                    margin-top: 0;
                    margin-bottom: 1em;
                    padding-left: 2em;
                }
                .rte ul ul {
                    list-style-type: circle;
                }
                .rte ul ul ul {
                    list-style-type: square;
                }
                .rte ol {
                    list-style-type: decimal;
                    margin-top: 0;
                    margin-bottom: 1em;
                    padding-left: 2em;
                }
                .rte li {
                    margin-bottom: 0.25em;
                    line-height: 1.6;
                }
                .rte li > p {
                    margin-bottom: 0.25em;
                }
                .rte li:last-child {
                    margin-bottom: 0;
                }
                .rte blockquote {
                    border-left: 4px solid hsl(var(--border));
                    margin: 1em 0;
                    padding-left: 1em;
                    font-style: italic;
                    color: hsl(var(--muted-foreground));
                }
                .rte blockquote p {
                    margin-bottom: 0.5em;
                }
                .rte blockquote p:last-child {
                    margin-bottom: 0;
                }
                .rte a {
                    color: hsl(var(--primary));
                    text-decoration: underline;
                    text-underline-offset: 2px;
                    cursor: pointer;
                }
                .rte a:hover {
                    opacity: 0.8;
                }
                .rte code {
                    background-color: hsl(var(--muted));
                    border-radius: 3px;
                    font-family: 'Courier New', Courier, monospace;
                    padding: 0.2em 0.4em;
                    font-size: 0.9em;
                }
                .rte pre {
                    background-color: hsl(var(--muted));
                    border-radius: 6px;
                    padding: 1em;
                    overflow-x: auto;
                    margin: 1em 0;
                }
                .rte pre code {
                    background-color: transparent;
                    padding: 0;
                    font-size: 0.9em;
                }
                .rte hr {
                    border: none;
                    border-top: 1px solid hsl(var(--border));
                    margin: 2em 0;
                }
                .rte:focus {
                    outline: none;
                }
                .rte > *:first-child {
                    margin-top: 0;
                }
                .rte > *:last-child {
                    margin-bottom: 0;
                }
                .rte .is-editor-empty:first-child::before {
                    content: attr(data-placeholder);
                    float: left;
                    color: var(--muted-foreground);
                    pointer-events: none;
                    height: 0;
                }
            `}</style>
        </div>
    );
}
