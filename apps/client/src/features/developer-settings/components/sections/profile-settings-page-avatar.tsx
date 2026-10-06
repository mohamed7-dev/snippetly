import { ProcessStatus } from '@/components/feedback/process-status';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImagePlusIcon } from 'lucide-react';
import React from 'react';
import { AvatarField, type AvatarUploadInfo } from '../forms/avatar-field';

export function ProfileSettingsPageAvatar() {
    const [uploadInfo, setUploadInfo] = React.useState<AvatarUploadInfo>({
        error: null,
        preview: null,
    });

    const handleChange = (uploadInfoPatch: Partial<AvatarUploadInfo>) => {
        setUploadInfo(prev => ({ ...prev, ...uploadInfoPatch }));
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <ImagePlusIcon className="h-5 w-5" />
                    Profile Picture
                </CardTitle>
                <CardDescription>Update your personal profile picture</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
                {!!uploadInfo.error && (
                    <ProcessStatus
                        variant={'destructive'}
                        title={uploadInfo.error.code}
                        description={uploadInfo.error.message}
                        onClose={() => setUploadInfo(prev => ({ ...prev, error: null }))}
                    />
                )}
                <AvatarField uploadInfo={uploadInfo} onChange={handleChange} />
            </CardContent>
        </Card>
    );
}
