import { InstallAppButton } from '@/components/inputs/install-app-button';
import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { SearchBar } from '@/features/search/components/search-bar';
import { Permission } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { DownloadIcon, PlusIcon } from 'lucide-react';
import { HeaderWrapper } from '../header-wrapper';
import { Logo } from '../logo';
import { HeaderUserMenu } from './header-user-menu';
import { MobileSidebar } from './mobile-sidebar';
import { NotificationsCenter } from '@/features/notifications/components/notifications-center';

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
                    <Button asChild>
                        <Link to="/dashboard/snippets/new">
                            <PlusIcon />
                            New Snippet
                        </Link>
                    </Button>
                </PermissionGuard>
                <NotificationsCenter />
                <HeaderUserMenu />
            </div>
        </HeaderWrapper>
    );
}
