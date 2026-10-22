import { FormControl, FormField, FormItem, FormMessage } from '@/components/ui/form';
import { useFormContext, type UseFormReturn } from 'react-hook-form';
import type { SnippetFormSchema } from '../../lib/schema';
import { SnippetCodeBlock } from '../shared/snippet-code-block';

export function SnippetFormCode() {
    const form: UseFormReturn<SnippetFormSchema> = useFormContext();

    return (
        <FormField
            control={form.control}
            name="code"
            render={() => (
                <FormItem>
                    <FormControl>
                        <SnippetCodeBlock
                            readOnly={false}
                            snippet={form.getValues()}
                            onChange={value => form.setValue('code', value)}
                        />
                    </FormControl>
                    <FormMessage />
                </FormItem>
            )}
        />
    );
}
