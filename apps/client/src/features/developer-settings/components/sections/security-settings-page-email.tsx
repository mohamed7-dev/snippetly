import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { CheckIcon, MailIcon } from 'lucide-react';
import React from 'react';

const RefreshAccountVerificationTokenDialog = React.lazy(async () => {
    const module =
        await import('@/features/auth/components/shared/refresh-account-verification-token-dialog');
    return { default: module.RefreshAccountVerificationTokenDialog };
});

export function SecuritySettingsPageEmail() {
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const isVerified = user?.user.isVerified ?? false;
    const emailAddress = user?.emailAddress ?? '';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MailIcon className="h-5 w-5" />
                    Email Settings
                </CardTitle>
                <CardDescription>Manage your email address and verification status</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isVerified ? (
                    <Alert className="border-secondary">
                        <MailIcon className="h-4 w-4 stroke-secondary" />
                        <AlertDescription className="text-sm font-semibold">
                            Your email address is not verified.
                        </AlertDescription>
                    </Alert>
                ) : (
                    <Alert className="border-primary">
                        <CheckIcon className="h-4 w-4" />
                        <AlertDescription>Your email address is verified.</AlertDescription>
                    </Alert>
                )}
                <div className="space-y-2">
                    <Label>Email Address</Label>
                    <Input value={emailAddress} readOnly={true} />
                </div>

                {!isVerified && (
                    <React.Fragment>
                        <Button type="button" onClick={() => setIsDialogOpen(true)}>
                            Verify Account
                        </Button>
                        <React.Suspense fallback={null}>
                            <RefreshAccountVerificationTokenDialog
                                isOpen={isDialogOpen}
                                onOpenChange={setIsDialogOpen}
                            />
                        </React.Suspense>
                    </React.Fragment>
                )}
            </CardContent>
        </Card>
    );
}
