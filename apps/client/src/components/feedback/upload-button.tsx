import { API_URL } from '@/lib/constants';
import { generateUploadButton } from '@uploadthing/react';

export const UploadButton = generateUploadButton({
    url: `${API_URL}/upload`,
});
