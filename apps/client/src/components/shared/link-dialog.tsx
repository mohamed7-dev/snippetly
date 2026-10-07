import { cn } from '@/lib/utils';
import { Editor } from '@tiptap/react';
import { XIcon } from 'lucide-react';
import React from 'react';
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

interface LinkDialogProps {
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
    editor: Editor;
}

export function LinkDialog({ isOpen, onOpenChange, editor }: LinkDialogProps) {
    const [linkHref, setLinkHref] = React.useState('');
    const [linkTitle, setLinkTitle] = React.useState('');
    const [linkTarget, setLinkTarget] = React.useState<LinkTarget>('_self');

    const isLinkEditingActive = editor.isActive('link');

    const onClose = () => {
        setLinkHref('');
        setLinkTitle('');
        setLinkTarget('_blank');
        onOpenChange(false);
    };

    const handleInsertingLink = () => {
        if (!linkHref) {
            editor.chain().focus().unsetLink().run();
        } else {
            editor
                .chain()
                .focus()
                .extendMarkRange('link')
                .setLink({
                    href: linkHref,
                    target: linkTarget,
                    rel: linkTarget === '_blank' ? 'noopener noreferrer' : undefined,
                })
                .run();
        }
        onClose();
    };

    const handleRemovingLink = () => {
        editor.chain().focus().unsetLink().run();
        onClose();
    };

    React.useEffect(() => {
        if (isOpen) {
            // if editing an existing selected link -> grab link info
            const {
                href: currentHref,
                target: currentTarget,
                title: currentTitle,
            } = editor.getAttributes('link');

            // Sync editor states with component states
            setLinkTarget(currentTarget === '_blank' ? '_blank' : '_self');
            setLinkHref(currentHref || '');
            setLinkTitle(currentTitle || '');

            // In case of selecting a non-link text -> check if the selection looks like a URL
            // and set it as the initial href
            if (!currentHref) {
                const { from, to } = editor.state.selection;
                const selectedText = editor.state.doc.textBetween(from, to);
                const isLinkAlike = selectedText.startsWith('http') || selectedText.startsWith('www');
                if (selectedText && isLinkAlike) {
                    setLinkHref(selectedText);
                }
            }
        }
    }, [isOpen, editor]);

    return (
        <AlertDialog open={isOpen} onOpenChange={onOpenChange}>
            <AlertDialogContent>
                <AlertDialogHeader className="flex-row items-center justify-between">
                    <AlertDialogTitle>{isLinkEditingActive ? 'Edit link' : 'Insert link'}</AlertDialogTitle>
                    <AlertDialogCancel asChild>
                        <Button variant="ghost" size="icon" aria-label="Close link editor">
                            <XIcon />
                        </Button>
                    </AlertDialogCancel>
                    <AlertDialogDescription className="sr-only">
                        {isLinkEditingActive
                            ? 'Edit the selected link properties'
                            : 'Insert a new hyperlink with URL and target options'}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <div className="space-y-4">
                    <Field>
                        <Label htmlFor="link-href">Link href</Label>
                        <Input
                            id="link-href"
                            value={linkHref}
                            onChange={e => setLinkHref(e.target.value)}
                            placeholder="https://<domain>"
                            className="col-span-3"
                            autoFocus
                        />
                    </Field>
                    <Field>
                        <Label htmlFor="link-title">Link title</Label>
                        <Input
                            id="link-title"
                            value={linkTitle}
                            onChange={e => setLinkTitle(e.target.value)}
                            placeholder="Accessible name of the link"
                            className="col-span-3"
                        />
                    </Field>
                    <Field>
                        <Label htmlFor="link-target">Link target</Label>
                        <Select
                            value={linkTarget}
                            onValueChange={value => setLinkTarget(value as LinkTarget)}
                        >
                            <SelectTrigger className="col-span-3">
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
                    {isLinkEditingActive && (
                        <Button type="button" variant="destructive" onClick={handleRemovingLink}>
                            Remove link
                        </Button>
                    )}
                    <Button type="button" variant="outline" onClick={onClose}>
                        Cancel
                    </Button>
                    <Button type="button" onClick={handleInsertingLink}>
                        Insert link
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}

function Field(props: React.HTMLAttributes<HTMLDivElement>) {
    return <div {...props} className={cn('grid grid-cols-4 items-center gap-4', props.className)} />;
}
