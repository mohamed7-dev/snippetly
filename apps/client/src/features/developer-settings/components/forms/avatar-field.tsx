import { UploadButton } from '@/components/feedback/upload-button';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { useAuth } from '@/features/auth/hooks/use-auth';
import { apiEndpoints } from '@/lib/api-endpoints';
import { LOCAL_STORAGE_SESSION_TOKEN_KEY } from '@/lib/constants';
import { mbToBytesBinary } from '@/lib/utils';
import { toast } from 'sonner';
import { twMerge } from 'tailwind-merge';

export type AvatarUploadInfo = {
    error: { code: string; message: string } | null;
    preview: string | null;
};

interface AvatarFieldProps {
    onChange: (uploadInfo: Partial<AvatarUploadInfo>) => void;
    uploadInfo: AvatarUploadInfo;
}

export function AvatarField({ onChange, uploadInfo }: AvatarFieldProps) {
    const { refreshActiveUser, user } = useAuth();

    const validateImage = (file: File) => {
        const isSizeLarge = file?.size > mbToBytesBinary(1);
        const isMediaValid = ['image/jpeg', 'image/jpeg', 'image/png', 'image/svg'].includes(file.type);

        if (isSizeLarge) {
            onChange({
                error: {
                    code: 'file-too-large',
                    message: 'File must not exceed 1 mb.',
                },
            });

            return false;
        } else if (!isMediaValid) {
            onChange({
                error: {
                    code: 'invalid-type',
                    message: 'Invalid media type, only jpeg, jpeg, png, and svg images are allowed.',
                },
            });
            return false;
        }
        return true;
    };

    const handleImageUpload = (files: File[]) => {
        const file = files?.[0];
        if (file) {
            const isValid = validateImage(file);
            if (!isValid) return false;
            const reader = new FileReader();
            reader.onload = e => {
                onChange({ preview: e.target?.result as string });
            };
            reader.readAsDataURL(file);
        }
    };
    return (
        <div className="flex items-center gap-4">
            <Avatar className="h-20 w-20">
                <AvatarImage src={uploadInfo.preview || user?.image || '/placeholder.svg'} alt="Profile" />
                <AvatarFallback>
                    {user?.firstName.slice(0, 1) + ' ' + user?.lastName.slice(0, 1)}
                </AvatarFallback>
            </Avatar>
            <div className="space-y-2">
                <UploadButton
                    config={{
                        cn: twMerge,
                    }}
                    headers={{
                        Authorization: `Bearer ${LOCAL_STORAGE_SESSION_TOKEN_KEY}`,
                    }}
                    endpoint={apiEndpoints.upload.profileImage.url}
                    onBeforeUploadBegin={async files => {
                        handleImageUpload(files);
                        return files;
                    }}
                    onClientUploadComplete={() => {
                        toast.success('Avatar image has been updated successfully.');
                        refreshActiveUser();
                    }}
                    onUploadError={e => {
                        toast.error(e.message);
                    }}
                />

                <p className="text-xs text-muted-foreground">JPG, JPEG, PNG, SVG . Max size 1MB.</p>
            </div>
        </div>
    );
}
