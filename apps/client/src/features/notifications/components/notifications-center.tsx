import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { BellIcon } from 'lucide-react';
import { useNotifications } from '../hooks/use-notifications';
import { NotificationItem } from './notification-item';

export function NotificationsCenter() {
    const { notifications, activeCount, hasMore, isLoadingMore, loadMore } = useNotifications();

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button
                    aria-label={`Notifications${activeCount ? `, ${activeCount} active` : ''}`}
                    className="relative"
                    size="icon"
                    variant="ghost"
                >
                    <BellIcon />
                    {activeCount > 0 && (
                        <Badge
                            className="absolute -right-1 -top-1 min-w-5 justify-center px-1"
                            variant="destructive"
                        >
                            {activeCount > 99 ? '99+' : activeCount}
                        </Badge>
                    )}
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[min(24rem,calc(100vw-2rem))]">
                <DropdownMenuLabel>Notifications</DropdownMenuLabel>
                <DropdownMenuSeparator />
                <div className="max-h-96 overflow-y-auto px-2">
                    {activeCount > 0 ? (
                        notifications.map(notification => (
                            <NotificationItem key={notification.definition.id} notification={notification} />
                        ))
                    ) : (
                        <p className="py-8 text-center text-sm text-muted-foreground">No notifications</p>
                    )}
                    {hasMore && (
                        <div className="flex justify-center py-3">
                            <Button
                                disabled={isLoadingMore}
                                onClick={() => void loadMore()}
                                size="sm"
                                variant="ghost"
                            >
                                {isLoadingMore ? 'Loading…' : 'Load more'}
                            </Button>
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
