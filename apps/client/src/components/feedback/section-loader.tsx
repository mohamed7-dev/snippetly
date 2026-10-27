import { StatusCard } from './status-card';

type SectionLoaderProps = {
    containerProps?: React.ComponentProps<'div'>;
    message?: string;
};

export function SectionLoader({ containerProps, message = 'Loading...' }: SectionLoaderProps) {
    return (
        <StatusCard
            variant="loading"
            title={message}
            layout="section"
            containerProps={containerProps}
            cardClassName="max-w-sm"
        />
    );
}
