import { PasswordField } from '@/components/inputs/password-field';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import type { ResetPasswordFormSchema } from '../../lib/schema';

export function PasswordResetForm({ isPending }: { isPending: boolean }) {
    const form = useFormContext<ResetPasswordFormSchema>();
    return (
        <FormField
            control={form.control}
            name="newPassword"
            render={({ field }) => {
                return (
                    <FormItem>
                        <FormLabel>
                            New Password<sup className="text-sm">*</sup>
                        </FormLabel>
                        <FormControl>
                            <PasswordField {...field} placeholder={'*'.repeat(12)} disabled={isPending} />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
