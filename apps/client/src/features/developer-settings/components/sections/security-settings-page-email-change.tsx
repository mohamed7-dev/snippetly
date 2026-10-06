import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@hookform/resolvers/zod';
import { MailIcon } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { useRequestEmailAddressChange } from '../../hooks/use-request-email-address-change';
import {
    requestEmailAddressChangeFormSchema,
    type RequestEmailAddressChangeFormSchemaType,
} from '../../lib/schema';
import { RequestEmailAddressChangeForm } from '../forms/request-email-address-change-form';

export function SecuritySettingsPageEmailChange() {
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
                    <MailIcon className="h-5 w-5" />
                    Email Address Change
                </CardTitle>
                <CardDescription>
                    Request email address change, and a verification link will be sent to your new email
                    address
                </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
                <Form {...form}>
                    <form className="space-y-4" onSubmit={form.handleSubmit(values => mutateAsync(values))}>
                        <RequestEmailAddressChangeForm isPending={isPending} />
                    </form>
                </Form>
            </CardContent>
        </Card>
    );
}
