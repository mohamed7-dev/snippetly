import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { toastApiError } from '@/lib/toast-api-error';
import { useDebounce } from '@uidotdev/usehooks';
import { EditIcon, LockIcon, RefreshCwIcon } from 'lucide-react';
import React from 'react';
import {
    useFormContext,
    useWatch,
    type ControllerRenderProps,
    type FieldPath,
    type FieldValues,
} from 'react-hook-form';
import { useGenerateSlugForEntity } from '../hooks/use-generate-slug-for-entity';

export type FormComponentProps<
    TFieldValues extends FieldValues = FieldValues,
    TName extends FieldPath<TFieldValues> = FieldPath<TFieldValues>,
> = ControllerRenderProps<TFieldValues, TName>;

export interface SlugInputProps extends FormComponentProps {
    entityName: string;
    fieldName: string;
    watchFieldName: string;
    entityId?: string;
    defaultReadonly?: boolean;
    className?: string;
}

function createOfflineSlug(value: string) {
    const base = value
        .normalize('NFKD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .trim()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');

    return `${base || 'untitled'}-${crypto.randomUUID().slice(0, 8)}`;
}

export function SlugInput({
    value,
    onChange,
    disabled,
    entityName,
    fieldName,
    watchFieldName,
    entityId,
    defaultReadonly = true,
    className,
    placeholder,
    ...props
}: SlugInputProps & { placeholder?: string }) {
    const form = useFormContext();

    const [manualReadonly, setManualReadonly] = React.useState(defaultReadonly);
    const [loading, setLoading] = React.useState(false);

    const formReadonly = !disabled;
    const readonly = formReadonly || manualReadonly;

    const watchPath = watchFieldName;

    const watchedValue = useWatch({
        control: form.control,
        name: watchPath,
    });

    const debouncedValue = useDebounce(watchedValue, 500);

    const fieldState = form.getFieldState(watchPath);

    const shouldAutoGenerate = readonly && !entityId && fieldState.isDirty && !!debouncedValue;
    const lastGeneratedFor = React.useRef<string | undefined>(undefined);

    const { mutateAsync: generateSlug } = useGenerateSlugForEntity();
    const createSlug = React.useCallback(
        async (inputValue: string) => {
            if (!navigator.onLine) return createOfflineSlug(inputValue);
            try {
                return await generateSlug({
                    entityName,
                    fieldName,
                    inputValue,
                    entityId,
                });
            } catch (error) {
                if (error instanceof TypeError) return createOfflineSlug(inputValue);
                throw error;
            }
        },
        [entityId, entityName, fieldName, generateSlug],
    );

    React.useEffect(() => {
        if (!shouldAutoGenerate || lastGeneratedFor.current === debouncedValue) {
            return;
        }

        let cancelled = false;
        lastGeneratedFor.current = debouncedValue;

        async function run() {
            try {
                setLoading(true);

                const slug = await createSlug(debouncedValue);

                if (!cancelled && slug !== value) {
                    onChange?.(slug);
                }
            } catch (error) {
                if (!cancelled) toastApiError(error);
            } finally {
                if (!cancelled) {
                    setLoading(false);
                }
            }
        }

        void run();

        return () => {
            cancelled = true;
        };
    }, [shouldAutoGenerate, debouncedValue, entityName, fieldName, entityId, value, onChange, createSlug]);

    async function regenerate() {
        if (!watchedValue) {
            return;
        }

        try {
            setLoading(true);

            const slug = await createSlug(watchedValue);

            onChange?.(slug);
        } catch (error) {
            toastApiError(error);
        } finally {
            setLoading(false);
        }
    }

    return (
        <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
                <Input
                    value={value ?? ''}
                    onChange={e => onChange?.(e.target.value)}
                    disabled={readonly}
                    placeholder={
                        readonly
                            ? value
                                ? 'Slug is set'
                                : (placeholder ?? 'Slug will be generated automatically...')
                            : 'Enter slug manually'
                    }
                    className={cn(
                        'pr-8',
                        readonly && 'bg-muted text-muted-foreground',
                        loading && 'text-muted-foreground',
                        className,
                    )}
                    {...props}
                />

                {loading && (
                    <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-muted-foreground border-t-transparent" />
                    </div>
                )}
            </div>

            {!formReadonly && (
                <React.Fragment>
                    {manualReadonly && value && (
                        <Button
                            type="button"
                            variant="outline"
                            size="icon"
                            onClick={regenerate}
                            disabled={!watchedValue || loading}
                            title={'Regenerate slug'}
                            aria-label={'Regenerate slug'}
                        >
                            <RefreshCwIcon />
                        </Button>
                    )}

                    <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        onClick={() => setManualReadonly(v => !v)}
                        title={manualReadonly ? 'Edit manually' : 'Generate automatically'}
                        aria-label={manualReadonly ? 'Edit manually' : 'Generate automatically'}
                    >
                        {manualReadonly ? <EditIcon /> : <LockIcon />}
                    </Button>
                </React.Fragment>
            )}
        </div>
    );
}
