import { PasswordField } from '@/components/inputs/password-field';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import type { UserType } from '@/lib/types';
import { Link } from '@tanstack/react-router';
import { useFormContext } from 'react-hook-form';
import type { DeveloperAuthenticationFormSchema } from '../../lib/schema';

export function SignInFormContent({ userType, isPending }: { userType: UserType; isPending: boolean }) {
    const form = useFormContext<DeveloperAuthenticationFormSchema>();
    return (
        <div className="space-y-4">
            <FormField
                control={form.control}
                name="native.identifier"
                render={({ field }) => {
                    return (
                        <FormItem>
                            <FormLabel htmlFor={field.name}>
                                {userType === 'developer' ? 'Email Address' : 'User Name'}
                                <sup className="text-sm">*</sup>
                            </FormLabel>
                            <Input
                                {...field}
                                type={userType === 'developer' ? 'email' : 'text'}
                                inputMode={userType === 'developer' ? 'email' : 'text'}
                                placeholder={userType === 'developer' ? 'test@example.com' : 'test'}
                                disabled={isPending}
                            />
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />
            <FormField
                control={form.control}
                name="native.password"
                render={({ field }) => {
                    return (
                        <FormItem>
                            <FormLabel htmlFor={field.name}>
                                Password<sup className="text-sm">*</sup>
                            </FormLabel>
                            <PasswordField
                                {...field}
                                type="password"
                                placeholder={'*'.repeat(12)}
                                disabled={isPending}
                            />
                            <FormMessage />
                        </FormItem>
                    );
                }}
            />

            <div className="flex items-center justify-between">
                <FormField
                    control={form.control}
                    name="native.rememberMe"
                    render={({ field }) => {
                        return (
                            <FormItem className="flex items-center gap-2">
                                <FormControl>
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={checked => field.onChange(checked as boolean)}
                                        disabled={isPending}
                                    />
                                </FormControl>
                                <FormLabel>Remember Me</FormLabel>
                                <FormMessage />
                            </FormItem>
                        );
                    }}
                />
                <Button variant={'link'} disabled={isPending} asChild>
                    <Link to={'/forgot-password'}>Forgot password?</Link>
                </Button>
            </div>
        </div>
    );
}
