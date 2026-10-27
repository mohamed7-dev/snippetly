import { useTheme } from 'next-themes';
import { Toaster as Sonner, type ToasterProps } from 'sonner';

const Toaster = ({ ...props }: ToasterProps) => {
    const { theme = 'system' } = useTheme();

    return (
        <Sonner
            theme={theme as ToasterProps['theme']}
            position="top-right"
            closeButton
            richColors
            expand
            visibleToasts={5}
            className="toaster group"
            toastOptions={{
                classNames: {
                    toast:
                        'group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg group-[.toaster]:rounded-xl group-[.toaster]:ring-1 group-[.toaster]:ring-border/60',
                    title: 'text-sm font-medium',
                    description: 'text-xs text-muted-foreground',
                    actionButton: 'bg-primary text-primary-foreground hover:bg-primary/90',
                    cancelButton: 'bg-muted text-muted-foreground hover:bg-muted/80',
                    closeButton: 'border-border bg-background text-foreground hover:bg-muted',
                },
            }}
            style={
                {
                    '--normal-bg': 'var(--popover)',
                    '--normal-text': 'var(--popover-foreground)',
                    '--normal-border': 'var(--border)',
                    '--success-bg': 'color-mix(in srgb, var(--primary) 12%, var(--popover))',
                    '--success-text': 'var(--foreground)',
                    '--success-border': 'color-mix(in srgb, var(--primary) 38%, var(--border))',
                    '--error-bg': 'color-mix(in srgb, var(--destructive) 10%, var(--popover))',
                    '--error-text': 'var(--foreground)',
                    '--error-border': 'color-mix(in srgb, var(--destructive) 42%, var(--border))',
                    '--warning-bg': 'color-mix(in srgb, var(--secondary) 12%, var(--popover))',
                    '--warning-text': 'var(--foreground)',
                    '--warning-border': 'color-mix(in srgb, var(--secondary) 42%, var(--border))',
                    '--info-bg': 'color-mix(in srgb, var(--primary) 12%, var(--popover))',
                    '--info-text': 'var(--foreground)',
                    '--info-border': 'color-mix(in srgb, var(--primary) 42%, var(--border))',
                    top: '1rem',
                    right: '1rem',
                } as React.CSSProperties
            }
            {...props}
        />
    );
};

export { Toaster };
