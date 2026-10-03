import React from 'react';
import { LoadingButton } from '../inputs/loading-button';
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from '../ui/alert-dialog';

type ConfirmationOptions = {
    title?: string;
    description?: string;
    onConfirm?: () => void | Promise<any>;
    isPending?: boolean;
};

type DeleteConfirmationContextType = {
    confirm: (options: ConfirmationOptions) => void;
    resetAndClose?: () => void;
};

export const DeleteConfirmationContext = React.createContext<DeleteConfirmationContextType | null>(null);

export function DeleteConfirmationProvider({ children }: { children: React.ReactNode }) {
    const [open, setOpen] = React.useState(false);
    const [options, setOptions] = React.useState<ConfirmationOptions>({});

    const confirm = React.useCallback((opts: ConfirmationOptions) => {
        setOptions(opts);
        setOpen(true);
    }, []);

    const resetAndClose = React.useCallback(() => {
        setOptions({});
        setOpen(false);
    }, []);

    const handleConfirm = async () => {
        if (options.onConfirm) await options.onConfirm();
        setOpen(false);
    };

    return (
        <DeleteConfirmationContext.Provider value={{ confirm, resetAndClose }}>
            {children}
            <AlertDialog open={open} onOpenChange={setOpen}>
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>{options.title ?? 'Confirm Deletion'}</AlertDialogTitle>
                        <AlertDialogDescription>
                            {options.description ??
                                'Are you sure you want to delete this item? This action cannot be undone.'}
                        </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction asChild>
                            <LoadingButton
                                isLoading={!!options.isPending}
                                disabled={options.isPending}
                                onClick={handleConfirm}
                            >
                                Delete
                            </LoadingButton>
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </DeleteConfirmationContext.Provider>
    );
}
