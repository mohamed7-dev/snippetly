import { cn } from '@/lib/utils';
import { Editor, useEditorState } from '@tiptap/react';
import {
    BoldIcon,
    ItalicIcon,
    LinkIcon,
    ListIcon,
    ListOrderedIcon,
    MoreHorizontalIcon,
    QuoteIcon,
    StrikethroughIcon,
} from 'lucide-react';
import React, { lazy } from 'react';
import { Button } from '../ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from '../ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

const LinkDialog = lazy(async () => {
    const mod = await import('./link-dialog');
    return { default: mod.LinkDialog };
});

const toolbarButtonClassName = 'h-8 px-2';

type HeadOptions = 'paragraph' | 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';

interface ToolbarItem {
    id: string;
    order: number;
    element: React.ReactNode;
    action?: () => void;
    label: string;
    isActive?: boolean;
}

interface ToolbarProps {
    editor: Editor | null;
    isDisabled?: boolean;
}

export function Toolbar({ editor, isDisabled }: ToolbarProps) {
    const toolbarContainerRef = React.useRef<HTMLDivElement | null>(null);
    const [isLinkDialogOpen, setIsLinkDialogOpen] = React.useState(false);

    const headingLevelsItems = React.useMemo(() => {
        return [
            { value: 'h1', label: 'Heading 1' },
            { value: 'h2', label: 'Heading 2' },
            { value: 'h3', label: 'Heading 3' },
            { value: 'h4', label: 'Heading 4' },
            { value: 'h5', label: 'Heading 5' },
            { value: 'h6', label: 'Heading 6' },
            { value: 'paragraph', label: 'Normal' },
        ];
    }, []);

    const resolveCurrentHeading = React.useCallback((): HeadOptions => {
        let headingOption: HeadOptions = 'paragraph';
        if (!editor) {
            headingOption = 'paragraph';
        }

        Array.from({ length: 6 }).forEach(level => {
            const isActiveHeading = editor?.isActive('heading', { level });
            if (isActiveHeading) {
                headingOption = `h${level}` as HeadOptions;
                return;
            }
        });

        return headingOption;
    }, [editor]);

    const handleHeadingChange = React.useCallback(
        (value: HeadOptions) => {
            if (!editor || !value) return;

            if (value === 'paragraph') {
                editor.chain().focus().setParagraph().run();
            } else {
                const level = parseInt(value.slice(1)) as 1 | 2 | 3 | 4 | 5 | 6;
                editor.chain().focus().toggleHeading({ level }).run();
            }
        },
        [editor],
    );

    // Toolbar Items
    const [visibleItems, setVisibleItems] = React.useState<ToolbarItem[]>([]);
    const [overflowItems, setOverflowItems] = React.useState<ToolbarItem[]>([]);

    const editorState = useEditorState({
        editor,
        selector: ctx => {
            if (!ctx.editor) return;
            return {
                isBold: ctx.editor.isActive('bold'),
                isItalic: ctx.editor.isActive('italic'),
                isStrike: ctx.editor.isActive('strike'),
                isOrderedList: ctx.editor.isActive('orderedList'),
                isBulletList: ctx.editor.isActive('bulletList'),
                isLink: ctx.editor.isActive('link'),
                isBlockquote: ctx.editor.isActive('blockquote'),
            };
        },
    });

    const toolbarItems: ToolbarItem[] = React.useMemo(() => {
        if (!editor || !editorState) return [];

        return [
            {
                id: 'bold',
                order: 1,
                isActive: editorState.isBold,
                label: 'Bold',
                action: () => editor.chain().focus().toggleBold().run(),
                element: (
                    <Button
                        variant="ghost"
                        size="sm"
                        key="bold"
                        type="button"
                        disabled={isDisabled}
                        className={cn(toolbarButtonClassName, editorState.isBold ? 'bg-accent' : '')}
                        onClick={() => editor.chain().focus().toggleBold().run()}
                    >
                        <BoldIcon />
                    </Button>
                ),
            },
            {
                id: 'italic',
                order: 2,
                isActive: editorState.isItalic,
                label: 'Italic',
                action: () => editor.chain().focus().toggleItalic().run(),
                element: (
                    <Button
                        variant="ghost"
                        size="sm"
                        key="italic"
                        type="button"
                        disabled={isDisabled}
                        className={cn(toolbarButtonClassName, editorState.isItalic ? 'bg-accent' : '')}
                        onClick={() => editor.chain().focus().toggleItalic().run()}
                    >
                        <ItalicIcon />
                    </Button>
                ),
            },
            {
                id: 'strikethrough',
                order: 3,
                isActive: editorState.isStrike,
                label: 'Strikethrough',
                action: () => editor.chain().focus().toggleStrike().run(),
                element: (
                    <Button
                        variant="ghost"
                        size="sm"
                        key="strikethrough"
                        type="button"
                        disabled={isDisabled}
                        className={cn(toolbarButtonClassName, editorState.isStrike ? 'bg-accent' : '')}
                        onClick={() => editor.chain().focus().toggleStrike().run()}
                    >
                        <StrikethroughIcon />
                    </Button>
                ),
            },
            {
                id: 'bulletList',
                order: 4,
                isActive: editorState.isBulletList,
                label: 'Bullet List',
                action: () => editor.chain().focus().toggleBulletList().run(),
                element: (
                    <Button
                        variant="ghost"
                        size="sm"
                        key="bulletList"
                        type="button"
                        disabled={isDisabled}
                        className={cn(toolbarButtonClassName, editorState.isBulletList ? 'bg-accent' : '')}
                        onClick={() => editor.chain().focus().toggleBulletList().run()}
                    >
                        <ListIcon />
                    </Button>
                ),
            },
            {
                id: 'orderedList',
                order: 5,
                isActive: editorState.isOrderedList,
                label: 'Ordered List',
                action: () => editor.chain().focus().toggleOrderedList().run(),
                element: (
                    <Button
                        variant="ghost"
                        size="sm"
                        key="orderedList"
                        type="button"
                        disabled={isDisabled}
                        className={cn(toolbarButtonClassName, editorState.isOrderedList ? 'bg-accent' : '')}
                        onClick={() => editor.chain().focus().toggleOrderedList().run()}
                    >
                        <ListOrderedIcon />
                    </Button>
                ),
            },
            {
                id: 'link',
                order: 6,
                label: 'Link',
                isActive: editorState.isLink,
                action: () => setIsLinkDialogOpen(true),
                element: (
                    <Button
                        variant="ghost"
                        size="sm"
                        key="link"
                        type="button"
                        disabled={isDisabled}
                        className={cn(toolbarButtonClassName, editorState.isLink ? 'bg-accent' : '')}
                        onClick={() => setIsLinkDialogOpen(true)}
                    >
                        <LinkIcon className="h-4 w-4" />
                    </Button>
                ),
            },
            {
                id: 'blockquote',
                order: 7,
                label: 'Blockquote',
                isActive: editorState.isBlockquote,
                action: () => editor.chain().focus().toggleBlockquote().run(),
                element: (
                    <Button
                        variant="ghost"
                        size="sm"
                        key="blockquote"
                        type="button"
                        disabled={isDisabled}
                        className={cn(toolbarButtonClassName, editorState.isBlockquote ? 'bg-accent' : '')}
                        onClick={() => editor.chain().focus().toggleBlockquote().run()}
                    >
                        <QuoteIcon className="h-4 w-4" />
                    </Button>
                ),
            },
        ] satisfies ToolbarItem[];
    }, [editor, editorState, isDisabled]);

    React.useEffect(() => {
        const getVisibleToolbarItems = () => {
            if (!toolbarContainerRef.current) return;

            const sortedItems = toolbarItems.sort((a, b) => a.order - b.order);

            const toolbarContainerWidth = toolbarContainerRef.current?.clientWidth;

            const buttonWidth = 40;
            const overflowButtonWidth = 40;
            const padding = 16;

            const headingSelectionBtnWidth = 130;

            const usedWidth = headingSelectionBtnWidth + padding;

            let remainingToolbarWidth = toolbarContainerWidth - usedWidth;

            const overflowItems: ToolbarItem[] = [];
            const visibleItems: ToolbarItem[] = [];

            sortedItems.forEach(item => {
                const isNotOverflowing =
                    remainingToolbarWidth >= buttonWidth + (overflowItems.length ? overflowButtonWidth : 0);

                if (isNotOverflowing) {
                    visibleItems.push(item);
                    remainingToolbarWidth -= buttonWidth;
                } else {
                    overflowItems.push(item);
                }
            });
            setVisibleItems(visibleItems);
            setOverflowItems(overflowItems);
        };

        getVisibleToolbarItems();

        const resizeObserver = new ResizeObserver(getVisibleToolbarItems);
        if (toolbarContainerRef.current) {
            resizeObserver.observe(toolbarContainerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, [toolbarItems, editor]);

    const visibleJSXElements = visibleItems.map(item => item.element);

    if (!editor) return null;

    return (
        <div ref={toolbarContainerRef} className="flex items-center gap-1 p-2 border-b bg-muted">
            <Select
                value={resolveCurrentHeading()}
                onValueChange={value => handleHeadingChange(value as HeadOptions)}
                disabled={isDisabled}
            >
                <SelectTrigger size="sm" className="w-32 py-1">
                    <SelectValue />
                </SelectTrigger>
                <SelectContent>
                    {headingLevelsItems.map(item => (
                        <SelectItem key={item.value} value={item.value}>
                            {item.label}
                        </SelectItem>
                    ))}
                </SelectContent>
            </Select>
            {visibleJSXElements}
            {!!overflowItems.length && (
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button
                            type="button"
                            variant={'ghost'}
                            size={'sm'}
                            className={cn(toolbarButtonClassName)}
                            disabled={isDisabled}
                        >
                            <MoreHorizontalIcon />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                        {overflowItems.map(item => (
                            <div key={item.id}>
                                <DropdownMenuItem
                                    onClick={item.action}
                                    className={cn(item.isActive ? 'bg-accent' : '')}
                                    disabled={isDisabled}
                                >
                                    {item.label}
                                </DropdownMenuItem>
                            </div>
                        ))}
                    </DropdownMenuContent>
                </DropdownMenu>
            )}
            <React.Suspense fallback={null}>
                <LinkDialog isOpen={isLinkDialogOpen} onOpenChange={setIsLinkDialogOpen} editor={editor} />
            </React.Suspense>
        </div>
    );
}
