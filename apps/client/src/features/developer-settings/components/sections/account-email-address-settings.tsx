import { ProcessStatus } from '@/components/feedback/process-status';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { MailIcon } from 'lucide-react';
import React from 'react';

const RefreshAccountVerificationTokenDialog = React.lazy(async () => {
    const module =
        await import('@/features/auth/components/shared/refresh-account-verification-token-dialog');
    return { default: module.RefreshAccountVerificationTokenDialog };
});

export function AccountEmailAddressSettings() {
    const { user } = useAuth();
    const [isDialogOpen, setIsDialogOpen] = React.useState(false);

    const isVerified = user?.isVerified ?? false;
    const emailAddress = user?.emailAddress ?? '';

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MailIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h2>Email address</h2>
                </CardTitle>
                <CardDescription>
                    <p>View your sign-in email address and its verification status.</p>
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                {!isVerified ? (
                    <ProcessStatus
                        variant={'info'}
                        title={'Not Verified'}
                        description="Your email address is not verified."
                        showCloseButton={false}
                    />
                ) : (
                    <ProcessStatus
                        variant={'info'}
                        title={'Verified'}
                        description="Your email address is verified."
                        showCloseButton={false}
                    />
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
