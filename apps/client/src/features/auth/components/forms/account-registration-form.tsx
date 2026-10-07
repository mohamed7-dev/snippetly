import { PasswordField } from '@/components/inputs/password-field';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useFormContext } from 'react-hook-form';
import type { AccountRegistrationFormSchema } from '../../lib/schema';

export function AccountRegistrationForm({ isPending }: { isPending: boolean }) {
    const form = useFormContext<AccountRegistrationFormSchema>();
    return (
        <div className="space-y-6">
            <div className="flex flex-col md:flex-row gap-4">
                <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>
                                    First Name<sup className="text-sm">*</sup>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="john" disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => {
                        return (
                            <FormItem>
                                <FormLabel>
                                    Last Name<sup className="text-sm">*</sup>
                                </FormLabel>
                                <FormControl>
                                    <Input {...field} placeholder="doe" disabled={isPending} />
                                </FormControl>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
            </div>
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
                                    placeholder="test@example.com"
                                    inputMode="email"
                                    type="email"
                                    disabled={isPending}
                                />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />
            <FormField
                control={form.control}
                name="password"
                render={({ field }) => {
                    return (
                        <FormItem>
                            <FormLabel>
                                Password<sup className="text-sm">*</sup>
                            </FormLabel>
                            <FormControl>
                                <PasswordField {...field} placeholder={'*'.repeat(12)} disabled={isPending} />
                            </FormControl>
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />

            <FormField
                control={form.control}
                name="isPrivate"
                render={({ field }) => {
                    return (
                        <FormItem>
                            <div className="flex items-center gap-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={checked => field.onChange(checked as boolean)}
                                    />
                                </FormControl>
                                <FormLabel>Make account private?</FormLabel>
                            </div>
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />
        </div>
    );
}
