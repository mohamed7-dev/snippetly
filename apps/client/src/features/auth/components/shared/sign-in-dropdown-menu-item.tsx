import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
import { Link } from '@tanstack/react-router';
import { LogInIcon } from 'lucide-react';

export function SignInDropdownMenuItem({ redirect }: { redirect: string }) {
    return (
        <DropdownMenuItem asChild>
            <Link to="/sign-in" search={{ redirect }} className="h-auto items-start py-2">
                <LogInIcon className="mt-0.5" />
                <span className="flex flex-col">
                    <span>Sign in</span>
                    <span className="text-xs font-normal text-muted-foreground">
                        Sign in to access more actions.
                    </span>
                </span>
            </Link>
        </DropdownMenuItem>
    );
}
