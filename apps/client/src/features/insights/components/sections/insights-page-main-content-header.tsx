import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { Permission } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { PlusIcon } from 'lucide-react';

export function InsightsPageMainContentHeader() {
    return (
        <div className="flex items-center justify-between flex-wrap gap-4 mb-4">
            <div>
                <h1 className="font-heading font-bold text-2xl">Insights</h1>
                <p className="text-muted-foreground">Manage and organize your code snippets</p>
            </div>
            <PermissionGuard
                requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                isAvailableOffline={true}
            >
                <Button asChild>
                    <Link to="/dashboard/snippets/new">
                        <PlusIcon />
                        <span>New Snippet</span>
                    </Link>
                </Button>
            </PermissionGuard>
        </div>
    );
}
