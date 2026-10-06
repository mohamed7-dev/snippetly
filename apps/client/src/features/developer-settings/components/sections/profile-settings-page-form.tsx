import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { UserIcon } from 'lucide-react';
import { UpdateDeveloperProfileForm } from '../forms/update-developer-profile-form';

export function ProfileSettingsPageForm({ isPending }: { isPending: boolean }) {
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <UserIcon className="h-5 w-5" />
                    Profile Information
                </CardTitle>
                <CardDescription>Update your personal information and profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                <UpdateDeveloperProfileForm isPending={isPending} />
            </CardContent>
        </Card>
    );
}
