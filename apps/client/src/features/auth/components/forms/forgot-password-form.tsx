import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import type { PasswordResetRequestFormSchema } from '../../lib/schema';

export function ForgotPasswordFormContent({ isPending }: { isPending: boolean }) {
    const form = useFormContext<PasswordResetRequestFormSchema>();
    return (
        <FormField
            control={form.control}
            name="emailAddress"
            render={({ field }) => {
                return (
                    <FormItem>
                        <FormLabel>
                            Email Address<sup className="text-sm">*</sup>
                        </FormLabel>
                        <FormControl>
                            <Input
                                {...field}
                                inputMode="email"
                                type="email"
                                placeholder="test@example.com"
                                disabled={isPending}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                );
            }}
        />
    );
}
