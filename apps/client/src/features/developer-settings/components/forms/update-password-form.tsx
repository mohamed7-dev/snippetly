import { LoadingButton } from '@/components/inputs/loading-button';
import { PasswordField } from '@/components/inputs/password-field';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { useFormContext } from 'react-hook-form';
import type { UpdatePasswordFormSchemaType } from '../../lib/schema';

export function UpdatePasswordForm({ isPending }: { isPending: boolean }) {
    const form = useFormContext<UpdatePasswordFormSchemaType>();
    return (
        <div className="space-y-6">
            <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>Current Password</FormLabel>
                        <FormControl>
                            <PasswordField
                                {...field}
                                placeholder="Enter your current password"
                                disabled={isPending}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                    <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                            <PasswordField
                                {...field}
                                placeholder="Enter your new password"
                                disabled={isPending}
                            />
                        </FormControl>
                        <FormMessage />
                    </FormItem>
                )}
            />

            <div>
                <LoadingButton isLoading={isPending} type="submit" className="w-full sm:w-auto">
                    Update Password
                </LoadingButton>
            </div>
        </div>
    );
}
