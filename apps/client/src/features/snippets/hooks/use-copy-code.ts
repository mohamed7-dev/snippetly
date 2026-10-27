import React from 'react';
import { toast } from 'sonner';

type UseCopyCodeProps = {
    code: string;
};
export function useCopyCode() {
    const [isCopied, setIsCopied] = React.useState(false);

    const copyCode = (input: UseCopyCodeProps) => {
        console.log('Copy Code', input.code);
        navigator.clipboard.writeText(input.code).then(() => {
            setIsCopied(true);
            toast.info('Snippet code is copied to the clipboard.');
            setTimeout(() => setIsCopied(false), 2000);
        });
    };

    return { copyCode, isCopied };
}
