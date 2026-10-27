import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { useRevokeSession } from '@/features/developer-settings/hooks/use-revoke-session';
import { activeSessionsQueryOptions } from '@/features/developer-settings/lib/sessions-query-options';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from '@tanstack/react-router';
import { LogOutIcon, MonitorIcon } from 'lucide-react';

const formatDate = (value: Date, includeTime = false) =>
    new Intl.DateTimeFormat(undefined, {
        dateStyle: 'medium',
        ...(includeTime ? { timeStyle: 'short' as const } : {}),
    }).format(new Date(String(value)));

export function SecuritySettingsPageSessions() {
    const { logout } = useAuth();
    const { data: sessions, error, isPending } = useQuery(activeSessionsQueryOptions());
    const { mutate, variables, isPending: isRevoking } = useRevokeSession();
    const navigate = useNavigate();

    const revoke = (sessionId: string, isCurrent: boolean) => {
        mutate(sessionId, {
            onSuccess: () => {
                if (isCurrent) void logout('developer', () => navigate({ to: '/' }));
            },
        });
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MonitorIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h2>Active sessions</h2>
                </CardTitle>
                <CardDescription>
                    <p>Review devices signed in to your account and sign them out.</p>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {isPending && <p className="text-sm text-muted-foreground">Loading sessions...</p>}
                {error && (
                    <p role="alert" className="text-sm text-destructive">
                        {error.message}
                    </p>
                )}
                {!isPending && !error && sessions?.length === 0 && (
                    <p className="text-sm text-muted-foreground">No active sessions found.</p>
                )}
                {sessions?.map(session => (
                    <div
                        key={session.id}
                        className="flex flex-col gap-3 rounded-lg border p-4 sm:flex-row sm:items-center sm:justify-between"
                    >
                        <div className="flex min-w-0 items-start gap-3">
                            <MonitorIcon className="mt-1 h-5 w-5 shrink-0 text-muted-foreground" />
                            <div className="min-w-0 space-y-1">
                                <div className="flex flex-wrap items-center gap-2">
                                    <p className="font-medium">{session.authenticationStrategy}</p>
                                    {session.isCurrent && <Badge variant="secondary">This device</Badge>}
                                </div>
                                <p className="wrap-break-word text-sm text-muted-foreground">
                                    {session.userAgent || 'Unknown device or browser'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                    Signed in {formatDate(session.createdAt, true)} · Expires{' '}
                                    {formatDate(session.expiresAt)}
                                </p>
                            </div>
                        </div>
                        <Button
                            variant="outline"
                            className="shrink-0"
                            disabled={isRevoking}
                            onClick={() => revoke(session.id, session.isCurrent)}
                        >
                            <LogOutIcon />
                            {isRevoking && variables === session.id ? 'Signing out...' : 'Sign out'}
                        </Button>
                    </div>
                ))}
            </CardContent>
        </Card>
    );
}
