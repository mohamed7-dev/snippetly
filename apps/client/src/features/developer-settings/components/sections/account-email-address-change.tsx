import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailPlusIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRequestEmailAddressChange } from '../../hooks/use-request-email-address-change';
import {
    requestEmailAddressChangeFormSchema,
    type RequestEmailAddressChangeFormSchemaType,
} from '../../lib/schema';
import { RequestEmailAddressChangeForm } from '../forms/request-email-address-change-form';

export function AccountEmailAddressChange() {
    const form = useForm<RequestEmailAddressChangeFormSchemaType>({
        defaultValues: {
            newEmailAddress: '',
            password: '',
        },
        resolver: zodResolver(requestEmailAddressChangeFormSchema),
    });

    const { mutateAsync, isPending } = useRequestEmailAddressChange();
    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <MailPlusIcon className="size-5 shrink-0 text-primary" aria-hidden="true" />
                    <h2>Change email address</h2>
                </CardTitle>
                <CardDescription>
                    <p>
                        Request a new sign-in email and confirm the change using the link sent to that address.
                    </p>
                </CardDescription>
            </CardHeader>
            <CardContent>
                <Form {...form}>
                    <form onSubmit={form.handleSubmit(values => mutateAsync(values))}>
                        <RequestEmailAddressChangeForm isPending={isPending} />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
