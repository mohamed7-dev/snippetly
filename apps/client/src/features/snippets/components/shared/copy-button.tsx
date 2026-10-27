import { Button } from '@/components/ui/button';
import { CopyCheckIcon, CopyIcon } from 'lucide-react';
import { useCopyCode } from '../../hooks/use-copy-code';

type CopyButtonProps = React.ComponentProps<typeof Button> & {
    code: string;
};

export function CopyButton({ code, children, ...props }: CopyButtonProps) {
    const { copyCode, isCopied } = useCopyCode();
    const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
        copyCode({ code: code });
        props?.onClick?.(e);
    };

    return (
        <Button {...props} onClick={handleClick}>
            {children ? (
                children
            ) : (
                <>
                    {isCopied ? <CopyCheckIcon /> : <CopyIcon />}
                    {isCopied ? 'Copied' : 'Copy Code'}
                </>
            )}
        </Button>
    );
}
