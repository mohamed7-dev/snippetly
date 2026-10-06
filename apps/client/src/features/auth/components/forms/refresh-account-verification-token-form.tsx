import { LoadingButton } from '@/components/inputs/loading-button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import {
    refreshAccountVerificationTokenFormSchema,
    type RefreshAccountVerificationTokenFormSchemaType,
} from '../../lib/schema';

export function RefreshAccountVerificationTokenForm({
    isPending,
    onSubmit,
}: {
    isPending: boolean;
    onSubmit: (values: RefreshAccountVerificationTokenFormSchemaType) => Promise<void>;
}) {
    const form = useForm<RefreshAccountVerificationTokenFormSchemaType>({
        defaultValues: {
            emailAddress: '',
        },
        resolver: zodResolver(refreshAccountVerificationTokenFormSchema),
    });
    return (
        <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
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
            </form>
        </Form>
    );
}
