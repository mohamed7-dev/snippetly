import { LoadingButton } from '@/components/inputs/loading-button';
import { PasswordField } from '@/components/inputs/password-field';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import type { RequestEmailAddressChangeFormSchemaType } from '../../lib/schema';

export function RequestEmailAddressChangeForm({ isPending }: { isPending: boolean }) {
    const form = useFormContext<RequestEmailAddressChangeFormSchemaType>();
    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="newEmailAddress"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Email Address</FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                inputMode="email"
                                type="email"
                                placeholder="Enter your new email address"
                                disabled={isPending}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                            <PasswordField
                                {...field}
                                type="password"
                                placeholder="Enter your password"
                                disabled={isPending}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <LoadingButton isLoading={isPending} type="submit">
                Request Change
            </LoadingButton>
        </div>
    );
}
