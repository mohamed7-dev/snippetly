import { Button } from '@/components/ui/button';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { cn } from '@/lib/utils';
import { Link } from '@tanstack/react-router';
import { SETTINGS_NAV_ITEMS } from '../../lib/constants';

export function SidebarContent() {
    return (
        <nav className="space-y-2">
            {SETTINGS_NAV_ITEMS.map(item => {
                return (
                    <PermissionGuard requiredPermissions={item.requiredPermissions}>
                        <Button variant="ghost" asChild>
                            <Link
                                key={item.href}
                                to={item.href}
                                activeProps={{ className: 'bg-primary text-primary-foreground' }}
                                activeOptions={{ exact: true }}
                                className={cn(
                                    'h-auto w-full text-muted-foreground overflow-hidden flex justify-start gap-3 rounded-lg p-3',
                                )}
                            >
                                <item.icon className="size-5 shrink-0" />
                                <div>
                                    <div className="font-medium">{item.title}</div>
                                    <div className={cn('text-xs  mt-1 whitespace-pre-wrap wrap-break-word')}>
                                        {item.description}
                                    </div>
                                </div>
                            </Link>
                        </Button>
                    </PermissionGuard>
                );
            })}
        </nav>
    );
}
