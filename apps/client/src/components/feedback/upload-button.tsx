import { apiEndpoints } from '@/lib/api-endpoints';
import { generateUploadButton } from '@uploadthing/react';

export const UploadButton = generateUploadButton({
    url: apiEndpoints.upload.base.url,
    appearance: {
        button: 'ut-button',
        allowedContent: 'ut-allowed-content',
        container: 'ut-container',
        label: 'ut-label',
    },
});
