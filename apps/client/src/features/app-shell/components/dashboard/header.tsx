import { InstallAppButton } from '@/components/inputs/install-app-button';
import { PageActionBar, PageActionBarItem, PageActionBarMenuItem } from '@/components/layout/page-action-bar';
import { CreateSnippetIcon } from '@/components/shared/creation-icons';
import { Button } from '@/components/ui/button';
import { DropdownMenuItem } from '@/components/ui/dropdown-menu';
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

            <PageActionBar>
                <PageActionBarItem>
                    <InstallAppButton className="px-2 sm:px-3">
                        <DownloadIcon />
                        <span>Install App</span>
                        <span className="sr-only">Install Snippetly</span>
                    </InstallAppButton>
                </PageActionBarItem>
                <PageActionBarItem>
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                        isAvailableOffline={true}
                    >
                        <Button asChild>
                            <Link to="/dashboard/snippets/new">
                                <CreateSnippetIcon className="size-4" />
                                <span>New Snippet</span>
                            </Link>
                        </Button>
                    </PermissionGuard>
                </PageActionBarItem>
                <PageActionBarItem>
                    <NotificationsCenter />
                </PageActionBarItem>

                <PageActionBarMenuItem>
                    <DropdownMenuItem asChild>
                        <InstallAppButton variant={'ghost'} className="w-full justify-start">
                            <DownloadIcon />
                            <span>Install App</span>
                            <span className="sr-only">Install Snippetly</span>
                        </InstallAppButton>
                    </DropdownMenuItem>
                </PageActionBarMenuItem>
                <PageActionBarMenuItem>
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                        isAvailableOffline={true}
                    >
                        <DropdownMenuItem asChild>
                            <Button variant={'ghost'} className="w-full justify-start" asChild>
                                <Link to="/dashboard/snippets/new">
                                    <CreateSnippetIcon className="size-4" />
                                    <span>New Snippet</span>
                                </Link>
                            </Button>
                        </DropdownMenuItem>
                    </PermissionGuard>
                </PageActionBarMenuItem>
            </PageActionBar>
        </HeaderWrapper>
    );
}
