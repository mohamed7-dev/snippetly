import { cn } from '@/lib/utils';
import {
    AlertTriangleIcon,
    CheckCircleIcon,
    FileQuestionIcon,
    InboxIcon,
    InfoIcon,
    LoaderPinwheelIcon,
} from 'lucide-react';
import type { ReactNode } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../ui/card';

type StatusCardVariant = 'loading' | 'error' | 'not-found' | 'empty' | 'success' | 'info';

type StatusCardLayout = 'page' | 'section' | 'inline';

const statusIcons = {
    loading: LoaderPinwheelIcon,
    error: AlertTriangleIcon,
    'not-found': FileQuestionIcon,
    empty: InboxIcon,
    success: CheckCircleIcon,
    info: InfoIcon,
};

const statusStyles: Record<StatusCardVariant, string> = {
    loading: 'bg-primary/10 text-primary',
    error: 'bg-destructive/10 text-destructive',
    'not-found': 'bg-primary/10 text-primary',
    empty: 'bg-muted text-muted-foreground',
    success: 'bg-primary/10 text-primary',
    info: 'bg-primary/10 text-primary',
};

type StatusCardProps = {
    variant: StatusCardVariant;
    title: string;
    description?: ReactNode;
    icon?: ReactNode;
    actions?: ReactNode;
    details?: ReactNode;
    children?: ReactNode;
    layout?: StatusCardLayout;
    containerProps?: React.ComponentProps<'div'>;
    cardClassName?: string;
    iconClassName?: string;
};

export function StatusCard({
    variant,
    title,
    description,
    icon,
    actions,
    details,
    children,
    layout = 'section',
    containerProps,
    cardClassName,
    iconClassName,
}: StatusCardProps) {
    const { className: containerClassName, ...containerRest } = containerProps ?? {};
    const Icon = statusIcons[variant];

    return (
        <div
            className={cn(
                'flex items-center justify-center p-4',
                layout === 'page' && 'min-h-screen bg-background',
                layout === 'section' && 'min-h-48 w-full',
                layout === 'inline' && 'w-full',
                containerClassName,
            )}
            {...containerRest}
        >
            <Card
                className={cn('w-full max-w-md text-center', cardClassName)}
                role={variant === 'error' ? 'alert' : 'status'}
                aria-live={variant === 'error' ? 'assertive' : 'polite'}
                aria-busy={variant === 'loading' ? true : undefined}
            >
                <CardHeader className="flex flex-col items-center gap-4 text-center">
                    <div
                        className={cn(
                            'size-16 rounded-full flex items-center justify-center',
                            statusStyles[variant],
                        )}
                        aria-hidden="true"
                    >
                        {icon ?? (
                            <Icon
                                className={cn(
                                    'size-8',
                                    variant === 'loading' && 'animate-spin',
                                    iconClassName,
                                )}
                            />
                        )}
                    </div>
                    <div className="space-y-2">
                        <CardTitle className="text-2xl font-bold">{title}</CardTitle>
                        {description && (
                            <CardDescription className="text-base">{description}</CardDescription>
                        )}
                    </div>
                </CardHeader>

                {(children || actions || details) && (
                    <CardContent className="space-y-4">
                        {children}
                        {actions && <div className="flex flex-col gap-3 [&>*]:w-full">{actions}</div>}
                        {details}
                    </CardContent>
                )}
            </Card>
        </div>
    );
}
