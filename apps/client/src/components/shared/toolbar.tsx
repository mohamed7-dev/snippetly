import { cn } from '@/lib/utils';
import type { Editor } from '@tiptap/react';
import { useEditorState } from '@tiptap/react';
import {
    BoldIcon,
    ItalicIcon,
    LinkIcon,
    ListIcon,
    ListOrderedIcon,
    MoreHorizontalIcon,
    QuoteIcon,
    StrikethroughIcon,
    type LucideIcon,
} from 'lucide-react';
import { lazy, Suspense, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const LinkDialog = lazy(async () => {
    const { LinkDialog: Dialog } = await import('./link-dialog');
    return { default: Dialog };
});

const buttonClassName = 'h-8 px-2';
const headingOptions = [
    { value: 'h1', label: 'Heading 1' },
    { value: 'h2', label: 'Heading 2' },
    { value: 'h3', label: 'Heading 3' },
    { value: 'h4', label: 'Heading 4' },
    { value: 'h5', label: 'Heading 5' },
    { value: 'h6', label: 'Heading 6' },
    { value: 'paragraph', label: 'Normal' },
] as const;

type HeadingOption = (typeof headingOptions)[number]['value'];
type EditorSelection = { from: number; to: number };

interface ToolbarItem {
    id: string;
    label: string;
    Icon: LucideIcon;
    active: boolean;
    action: () => void;
}

interface ToolbarProps {
    editor: Editor | null;
    isDisabled?: boolean;
}

export function Toolbar({ editor, isDisabled = false }: ToolbarProps) {
    const containerRef = useRef<HTMLDivElement>(null);
    const [visibleIds, setVisibleIds] = useState<string[]>([]);
    const [linkDialogOpen, setLinkDialogOpen] = useState(false);
    const [linkSelection, setLinkSelection] = useState<EditorSelection>({ from: 0, to: 0 });

    const editorState = useEditorState({
        editor,
        selector: ({ editor: currentEditor }) =>
            currentEditor
                ? {
                      bold: currentEditor.isActive('bold'),
                      italic: currentEditor.isActive('italic'),
                      strike: currentEditor.isActive('strike'),
                      bulletList: currentEditor.isActive('bulletList'),
                      orderedList: currentEditor.isActive('orderedList'),
                      link: currentEditor.isActive('link'),
                      blockquote: currentEditor.isActive('blockquote'),
                  }
                : null,
    });

    const heading = useMemo<HeadingOption>(() => {
        if (!editor) return 'paragraph';
        for (let level = 1; level <= 6; level += 1) {
            if (editor.isActive('heading', { level })) return `h${level}` as HeadingOption;
        }
        return 'paragraph';
    }, [editor, editorState]);

    const openLinkDialog = useCallback(() => {
        if (!editor) return;
        const { from, to } = editor.state.selection;
        setLinkSelection({ from, to });
        setLinkDialogOpen(true);
    }, [editor]);

    const items = useMemo<ToolbarItem[]>(() => {
        if (!editor || !editorState) return [];
        return [
            {
                id: 'bold',
                label: 'Bold',
                Icon: BoldIcon,
                active: editorState.bold,
                action: () => editor.chain().focus().toggleBold().run(),
            },
            {
                id: 'italic',
                label: 'Italic',
                Icon: ItalicIcon,
                active: editorState.italic,
                action: () => editor.chain().focus().toggleItalic().run(),
            },
            {
                id: 'strikethrough',
                label: 'Strikethrough',
                Icon: StrikethroughIcon,
                active: editorState.strike,
                action: () => editor.chain().focus().toggleStrike().run(),
            },
            {
                id: 'bulletList',
                label: 'Bullet List',
                Icon: ListIcon,
                active: editorState.bulletList,
                action: () => editor.chain().focus().toggleBulletList().run(),
            },
            {
                id: 'orderedList',
                label: 'Ordered List',
                Icon: ListOrderedIcon,
                active: editorState.orderedList,
                action: () => editor.chain().focus().toggleOrderedList().run(),
            },
            { id: 'link', label: 'Link', Icon: LinkIcon, active: editorState.link, action: openLinkDialog },
            {
                id: 'blockquote',
                label: 'Blockquote',
                Icon: QuoteIcon,
                active: editorState.blockquote,
                action: () => editor.chain().focus().toggleBlockquote().run(),
            },
        ];
    }, [editor, editorState, openLinkDialog]);

    useEffect(() => {
        const container = containerRef.current;
        if (!container) return;

        const updateVisibleItems = () => {
            const buttonWidth = 40;
            const overflowButtonWidth = 40;
            let availableWidth = container.clientWidth - 146;
            const shown: string[] = [];
            const hidden: string[] = [];

            for (const item of items) {
                const reserveOverflow = hidden.length > 0 ? overflowButtonWidth : 0;
                if (availableWidth >= buttonWidth + reserveOverflow) {
                    shown.push(item.id);
                    availableWidth -= buttonWidth;
                } else {
                    hidden.push(item.id);
                }
            }

            setVisibleIds(shown);
        };

        updateVisibleItems();
        const observer = new ResizeObserver(updateVisibleItems);
        observer.observe(container);
        return () => observer.disconnect();
    }, [items]);

    const applyHeading = (value: HeadingOption) => {
        if (!editor) return;
        if (value === 'paragraph') {
            editor.chain().focus().setParagraph().run();
        } else {
            editor
                .chain()
                .focus()
                .toggleHeading({ level: Number(value.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6 })
                .run();
        }
    };

    if (!editor) return null;

    const visibleItems = items.filter(item => visibleIds.includes(item.id));
    const overflowItems = items.filter(item => !visibleIds.includes(item.id));

    return (
        <div ref={containerRef} className="flex items-center gap-1 p-2 border-b bg-muted">
            <Select
                value={heading}
                onValueChange={value => applyHeading(value as HeadingOption)}
                disabled={isDisabled}
            >
                <SelectTrigger size="sm" className="w-32 py-1">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {headingOptions.map(option => (
                        <SelectItem key={option.value} value={option.value}>
                            {option.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>

            {visibleItems.map(({ id, label, Icon, active, action }) => (
                <Button
                    key={id}
                    type="button"
                    variant="ghost"
                    size="sm"
                    aria-label={label}
                    title={label}
                    disabled={isDisabled}
                    className={cn(buttonClassName, active && 'bg-accent')}
                    onMouseDown={event => event.preventDefault()}
                    onClick={action}
                >
                    <Icon className="h-4 w-4" />
                </Button>
            ))}

            {overflowItems.length > 0 && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant="ghost"
                            size="sm"
                            aria-label="More formatting options"
                            className={buttonClassName}
                            disabled={isDisabled}
                        >
                            <MoreHorizontalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {overflowItems.map(({ id, label, active, action }) => (
                            <DropdownMenuItem
                                key={id}
                                className={cn(active && 'bg-accent')}
                                disabled={isDisabled}
                                onSelect={action}
                            >
                                {label}
                            </DropdownMenuItem>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}

            <Suspense fallback={null}>
                <LinkDialog
                    isOpen={linkDialogOpen}
                    onOpenChange={setLinkDialogOpen}
                    editor={editor}
                    selection={linkSelection}
                />
            </Suspense>
        </div>
    );
}
