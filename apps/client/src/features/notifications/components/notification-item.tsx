import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { AlertCircleIcon, InfoIcon, TriangleAlertIcon, XIcon } from 'lucide-react';
import type { NotificationEntry } from '../hooks/use-notifications';
import type { NotificationAction } from '../lib/notification-types';

const severityStyles = {
    error: 'text-destructive',
    info: 'text-primary',
    warning: 'text-amber-600 dark:text-amber-400',
};

const severityIcons = {
    error: AlertCircleIcon,
    info: InfoIcon,
    warning: TriangleAlertIcon,
};

export function NotificationItem({ notification }: { notification: NotificationEntry }) {
    if (!notification.active) return null;

    const { definition } = notification;
    const Icon = severityIcons[notification.severity];
    const title = notification.error
        ? 'Could not check notification'
        : typeof definition.title === 'function'
          ? definition.title(notification.data)
          : definition.title;
    const description =
        notification.error?.message ??
        (typeof definition.description === 'function'
            ? definition.description(notification.data)
            : definition.description);

    return (
        <article className="flex items-start gap-3 border-b py-3 last:border-b-0">
            <Icon className={cn('mt-0.5 size-4 shrink-0', severityStyles[notification.severity])} />
            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium">{title}</p>
                {description && <p className="mt-1 text-xs text-muted-foreground">{description}</p>}
                {definition.actions?.length ? (
                    <div className="mt-2 flex flex-wrap gap-2">
                        {definition.actions.map((action, index) => (
                            <NotificationActionItem
                                action={action}
                                data={notification.data}
                                dismiss={notification.dismiss}
                                key={`${action.label}-${index}`}
                            />
                        ))}
                    </div>
                ) : null}
            </div>
            <Button
                aria-label={`Dismiss ${title}`}
                className="size-7 shrink-0"
                onClick={notification.dismiss}
                size="icon"
                variant="ghost"
            >
                <XIcon />
            </Button>
        </article>
    );
}

function NotificationActionItem({
    action,
    data,
    dismiss,
}: {
    action: NotificationAction<unknown>;
    data: unknown;
    dismiss: () => void;
}) {
    if (action.component) {
        const ActionComponent = action.component;
        return <ActionComponent data={data} dismiss={dismiss} />;
    }

    if (!action.onClick) return null;
    const onClick = action.onClick;

    return (
        <Button
            onClick={() => {
                void Promise.resolve()
                    .then(() => onClick({ data, dismiss }))
                    .catch(error => {
                        toast.error(`Could not complete "${action.label}"`, {
                            description:
                                error instanceof Error ? error.message : 'Please try again.',
                        });
                    });
            }}
            size="sm"
            variant="secondary"
        >
            {action.label}
        </Button>
    );
}
