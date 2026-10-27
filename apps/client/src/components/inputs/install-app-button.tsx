import { useInstallPrompt } from '@/hooks/use-install-prompt';
import { cn } from '@/lib/utils';
import { DownloadIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

type Props = {
    className?: string;
    children?: React.ReactNode;
    size?: React.ComponentProps<typeof Button>['size'];
    variant?: React.ComponentProps<typeof Button>['variant'];
};

export function InstallAppButton({ className, children, size, variant = 'outline' }: Props) {
    const { supportsInstall, isInstalled, promptInstall } = useInstallPrompt();
    if (isInstalled || !supportsInstall) return null;

    return (
        <Button
            type="button"
            variant={variant}
            size={size}
            onClick={() => {
                void promptInstall();
            }}
            className={cn('hover:text-muted-foreground', className)}
            title="Install this app"
        >
            {children ?? (
                <React.Fragment>
                    <DownloadIcon />
                    <span>Install App</span>
                </React.Fragment>
            )}
        </Button>
    );
}
