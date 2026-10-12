import { cn } from '@/lib/utils';
import type { Editor } from '@tiptap/react';
import { XIcon } from 'lucide-react';
import { useEffect, useRef, useState, type HTMLAttributes } from 'react';
import {
    AlertDialog,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '../ui/select';

type LinkTarget = '_self' | '_blank';
type EditorSelection = { from: number; to: number };

interface LinkDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editor: Editor;
    selection: EditorSelection;
}

export function LinkDialog({ isOpen, onOpenChange, editor, selection }: LinkDialogProps) {
    const [href, setHref] = useState('');
    const [title, setTitle] = useState('');
    const [target, setTarget] = useState<LinkTarget>('_self');
    const selectionRef = useRef(selection);
    const isEditingLink = editor.isActive('link');

    useEffect(() => {
        if (!isOpen) return;

        selectionRef.current = selection;
        const attributes = editor.getAttributes('link');
        const selectedText = editor.state.doc.textBetween(selection.from, selection.to);
        const currentHref = typeof attributes.href === 'string' ? attributes.href : '';
        const initialHref =
            currentHref ||
            (selectedText.startsWith('http') || selectedText.startsWith('www') ? selectedText : '');

        setHref(initialHref);
        setTitle(typeof attributes.title === 'string' ? attributes.title : '');
        setTarget(attributes.target === '_blank' ? '_blank' : '_self');
    }, [editor, isOpen, selection]);

    const close = () => {
        setHref('');
        setTitle('');
        setTarget('_self');
        onOpenChange(false);
    };

    const linkAttributes = () => ({
        href: href.trim(),
        title: title.trim() || null,
        target,
        rel: target === '_blank' ? 'noopener noreferrer' : null,
    });

    const insertLink = () => {
        const normalizedHref = href.trim();
        const range = selectionRef.current;

        if (!normalizedHref) {
            editor.chain().focus().setTextSelection(range).unsetLink().run();
            close();
            return;
        }

        const attributes = linkAttributes();
        const chain = editor.chain().focus().setTextSelection(range);

        if (range.from === range.to && !editor.isActive('link')) {
            chain
                .insertContent({
                    type: 'text',
                    text: title.trim() || normalizedHref,
                    marks: [{ type: 'link', attrs: attributes }],
                })
                .run();
        } else {
            chain.extendMarkRange('link').setLink(attributes).run();
        }

        close();
    };

    const removeLink = () => {
        editor
            .chain()
            .focus()
            .setTextSelection(selectionRef.current)
            .extendMarkRange('link')
            .unsetLink()
            .run();
        close();
    };

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader className="flex-row items-center justify-between">
                    <AlertDialogTitle>{isEditingLink ? 'Edit link' : 'Insert link'}</AlertDialogTitle>
                    <AlertDialogCancel asChild>
                        <Button variant="ghost" size="icon" aria-label="Close link editor">
                            <XIcon />
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogDescription className="sr-only">
                        {isEditingLink
                            ? 'Edit the selected link properties'
                            : 'Insert a new hyperlink with URL and target options'}
                    </AlertDialogDescription>
                </AlertDialogHeader>

                <div className="space-y-4">
                    <Field>
                        <Label htmlFor="link-href">Link href</Label>
                        <Input
                            id="link-href"
                            value={href}
                            onChange={event => setHref(event.target.value)}
                            placeholder="https://<domain>"
                            className="col-span-3"
                            autoFocus
                        />
                    </Field>
                    <Field>
                        <Label htmlFor="link-title">Link title</Label>
                        <Input
                            id="link-title"
                            value={title}
                            onChange={event => setTitle(event.target.value)}
                            placeholder="Accessible name of the link"
                            className="col-span-3"
                        />
                    </Field>
                    <Field>
                        <Label htmlFor="link-target">Link target</Label>
                        <Select value={target} onValueChange={value => setTarget(value as LinkTarget)}>
                            <SelectTrigger id="link-target" className="col-span-3">
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="_blank">New window</SelectItem>
                                <SelectItem value="_self">Same window</SelectItem>
                            </SelectContent>
                        </Select>
                    </Field>
                </div>

                <AlertDialogFooter>
                    {isEditingLink && (
                        <Button type="button" variant="destructive" onClick={removeLink}>
                            Remove link
                        </Button>
                    )}
                    <Button type="button" variant="outline" onClick={close}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={insertLink}>
                        Insert link
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function Field(props: HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={cn('grid grid-cols-4 items-center gap-4', props.className)} />;
}
