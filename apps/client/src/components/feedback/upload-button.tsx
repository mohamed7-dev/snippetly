import { apiEndpoints } from '@/lib/api-endpoints';
import { generateUploadButton, type UploadthingComponentProps } from '@uploadthing/react';
import type { OurFileRouter } from '../../../../server/src/services/helpers/uploadthing-router.type';

type UploadButtonProps = Omit<UploadthingComponentProps<OurFileRouter, 'upload-avatar'>, 'url' | 'fetch'> & {
    appearance?: {
        button?: string;
        allowedContent?: string;
    };
};

const GeneratedUploadButton = generateUploadButton<OurFileRouter>({
    url: apiEndpoints.upload.base.url,
});

export function UploadButton(props: UploadButtonProps) {
    return (
        <GeneratedUploadButton
            {...props}
            className="ut-button:bg-primary ut-button:rounded-lg ut-button:border ut-button:border-border ut-button:text-primary-foreground ut-button:shadow-sm ut-button:transition-colors ut-button:hover:bg-primary/90 ut-button:ut-readying:bg-primary/90 ut-allowed-content:text-xs ut-allowed-content:text-muted-foreground ut-button:ut-ready:bg-primary ut-button:ut-uploading:cursor-not-allowed ut-button:ut-uploading:outline-none ut-button:focus-within:border-ring ut-button:focus-within:ring-ring/50 ut-button:focus-within:ring-[3px]"
        />
    );
}
