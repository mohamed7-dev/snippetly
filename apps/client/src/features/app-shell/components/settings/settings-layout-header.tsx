import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon } from 'lucide-react';
import { HeaderUserMenu } from '../dashboard/header-user-menu';
import { HeaderWrapper } from '../header-wrapper';
import { MobileSidebar } from './mobile-sidebar';

export function SettingsLayoutHeader() {
    return (
        <HeaderWrapper className="justify-between">
            <div className="flex items-center gap-4">
                <MobileSidebar />
                <Button variant={'link'} asChild>
                    <Link to="/dashboard">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to Dashboard
                    </Link>
                </Button>
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Settings</h1>
            </div>
            <HeaderUserMenu />
        </HeaderWrapper>
    );
}
