import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import type React from 'react';
import { Button } from '../ui/button';

type GoToButtonProps = React.ComponentProps<typeof Button> &
    React.ComponentProps<typeof Link> & {
        label?: string;
        showIcon?: boolean;
    };

export function GoToButton({ to, label, variant, showIcon = true, ...props }: GoToButtonProps) {
    return (
        <Button {...props} variant={variant ?? 'link'} asChild>
            <Link to={to ?? '..'}>
                {showIcon && <ArrowLeftIcon />}
                {label || 'Go Back'}
            </Link>
        </Button>
    );
}
