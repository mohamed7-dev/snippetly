import { LoadingButton } from '@/components/inputs/loading-button';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import type { RefreshAccountVerificationTokenFormSchemaType } from '../../lib/schema';

export function RefreshAccountVerificationTokenForm({ isPending }: { isPending: boolean }) {
    const form = useFormContext<RefreshAccountVerificationTokenFormSchemaType>();
    return (
        <div className="space-y-8">
            <FormField
                control={form.control}
                name="emailAddress"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                placeholder="Enter your email address"
                                inputMode="email"
                                type="email"
                                disabled={isPending}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <LoadingButton isLoading={isPending} type="submit">
                Send Fresh Token
            </LoadingButton>
        </div>
    );
}
