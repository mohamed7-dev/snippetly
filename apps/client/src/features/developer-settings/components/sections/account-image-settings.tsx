import { ProcessStatus } from '@/components/feedback/process-status';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ImageIcon } from 'lucide-react';
import React from 'react';
import { AvatarField, type AvatarUploadInfo } from '../forms/avatar-field';

export function AccountImageSettings() {
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
                    <ImageIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h2>Profile photo</h2>
                </CardTitle>
                <CardDescription>
                    <p>Upload or update the image shown on your profile.</p>
                </CardDescription>
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
