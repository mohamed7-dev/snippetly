import { StatusCard } from '@/components/feedback/status-card';
import { cn } from '@/lib/utils';
import { LoaderPinwheelIcon } from 'lucide-react';

type PageLoaderProps = {
    containerProps?: React.ComponentProps<'div'>;
    iconProps?: React.ComponentProps<'svg'>;
};
export function PageLoadingView({ containerProps, iconProps }: PageLoaderProps) {
    const { className: iconClassName, ...iconRest } = iconProps ?? {};

    return (
        <StatusCard
            variant="loading"
            title="Loading..."
            description="Please wait while we get things ready."
            layout="page"
            containerProps={containerProps}
            icon={
                <LoaderPinwheelIcon
                    className={cn('size-8 animate-spin', iconClassName)}
                    aria-hidden="true"
                    {...iconRest}
                />
            }
        />
    );
}

export { PageLoadingView as PageLoader };
