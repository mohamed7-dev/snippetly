import { InstallAppButton } from '@/components/inputs/install-app-button';
import { Button } from '@/components/ui/button';
import { CreateSnippetIcon } from '@/components/shared/creation-icons';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { NotificationsCenter } from '@/features/notifications/components/notifications-center';
import { SearchBar } from '@/features/search/components/search-bar';
import { Permission } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { DownloadIcon } from 'lucide-react';
import { HeaderWrapper } from '../header-wrapper';
import { Logo } from '../logo';
import { MobileSidebar } from './mobile-sidebar';

export function DashBoardHeader() {
    return (
        <HeaderWrapper className="justify-between px-1 lg:px-4">
            <MobileSidebar />

            <div className="flex items-center gap-4">
                <Logo />
                <SearchBar className="hidden w-96 max-w-sm lg:block" />
            </div>

            <div className="flex items-center gap-4">
                <InstallAppButton className="px-2 sm:px-3">
                    <DownloadIcon />
                    <span className="hidden sm:inline">Install App</span>
                    <span className="sr-only sm:hidden">Install Snippetly</span>
                </InstallAppButton>
                <PermissionGuard
                    requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                    isAvailableOffline={true}
                >
                    <Button className="hidden sm:flex" asChild>
                        <Link to="/dashboard/snippets/new">
                            <CreateSnippetIcon className="size-4" />
                            <span>New Snippet</span>
                        </Link>
                    </Button>
                </PermissionGuard>
                <NotificationsCenter />
            </div>
        </HeaderWrapper>
    );
}
