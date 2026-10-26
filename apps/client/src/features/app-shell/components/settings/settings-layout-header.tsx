import { GoToButton } from '@/components/inputs/goto-button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { Permission } from '@snippetly/common/dto';
import { HeaderUserMenu } from '../dashboard/header-user-menu';
import { HeaderWrapper } from '../header-wrapper';
import { MobileSidebar } from './mobile-sidebar';

export function SettingsLayoutHeader() {
    return (
        <HeaderWrapper className="justify-between">
            <div className="flex items-center gap-4">
                <MobileSidebar />
                <GoToButton label="Back to Dashboard" to="/dashboard" className="hidden lg:flex" />
                <h1 className="text-xl sm:text-3xl font-bold tracking-tight">Settings</h1>
            </div>
            <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                <HeaderUserMenu />
            </PermissionGuard>
        </HeaderWrapper>
    );
}
