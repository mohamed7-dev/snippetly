import { apiEndpoints } from '@/lib/api-endpoints';
import { generateUploadButton } from '@uploadthing/react';

export const UploadButton = generateUploadButton({
    url: apiEndpoints.upload.base.url,
});
