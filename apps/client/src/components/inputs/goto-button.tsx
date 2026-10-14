import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { Button } from '../ui/button';

type GoToButtonProps = {
    to?: string;
    label?: string;
};

export function GoToButton({ to, label }: GoToButtonProps) {
    return (
        <Button variant={'link'} asChild>
            <Link to={to ?? '..'}>
                <ArrowLeftIcon />
                {label || 'Go Back'}
            </Link>
        </Button>
    );
}
