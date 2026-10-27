import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { Permission } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { Settings2Icon } from 'lucide-react';
import { HeaderUserMenu } from './header-user-menu';

export function DashboardSidebarFooter() {
    return (
        <footer className="space-y-2 border-t border-border p-4">
            <PermissionGuard requiredPermissions={[Permission.Authenticated]}>
                <Button asChild variant="outline" className="w-full justify-start">
                    <Link to="/dashboard/settings">
                        <Settings2Icon />
                        <span>Settings</span>
                    </Link>
                </Button>
            </PermissionGuard>

            <HeaderUserMenu display="sidebar" />
        </footer>
    );
}
