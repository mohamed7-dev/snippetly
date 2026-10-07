export interface AsyncActionCallback<D, E, V = any> {
    onSuccess?: (info: D, variables?: V) => void;
    onError?: (info: E) => void;
    onSettled?: () => void;
    onMutate?: () => void;
}

export type UserType = 'developer' | 'admin';
