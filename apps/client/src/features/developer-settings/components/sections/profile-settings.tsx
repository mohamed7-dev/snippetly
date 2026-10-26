import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserRoundIcon } from 'lucide-react';
import { UpdateDeveloperProfileForm } from '../forms/update-developer-profile-form';

export function ProfileSettings({ isPending }: { isPending: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserRoundIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h2>Profile Information</h2>
                </CardTitle>
                <CardDescription>
                    <p>Update your name, bio, and profile visibility.</p>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <UpdateDeveloperProfileForm isPending={isPending} />
            </CardContent>
        </Card>
    );
}
