export interface AsyncActionCallback<D, E> {
    onSuccess?: (info: D) => void;
    onError?: (info: E) => void;
    onSettled?: () => void;
    onMutate?: () => void;
}

export type UserType = 'developer' | 'admin';
