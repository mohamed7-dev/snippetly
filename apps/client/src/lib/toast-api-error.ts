import { toast } from 'sonner';
import { formatApiError } from './format-api-error';

export function toastApiError(error: unknown) {
    const formattedError = formatApiError(error);

    if (formattedError.description) {
        toast.error(formattedError.title, { description: formattedError.description });
    } else {
        toast.error(formattedError.title);
    }

    return formattedError;
}
