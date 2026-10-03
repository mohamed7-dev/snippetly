import { cn } from '@/lib/utils';
import { type UseFormReturn } from 'react-hook-form';
import { PageProvider } from '../providers/page-provider';
import { Form } from '../ui/form';

interface PageProps extends React.ComponentProps<'div'> {
    form?: UseFormReturn<any>;
    submitHandler?: any;
    entity?: any;
}

export function Page(props: PageProps) {
    const { children, entity, submitHandler, form, ...restProps } = props;

    return (
        <PageProvider entity={entity} form={form}>
            <div className={cn(restProps.className)} {...restProps}>
                {form ? (
                    <Form {...form}>
                        <form onSubmit={submitHandler} className="space-y-4">
                            {children}
                        </form>
                    </Form>
                ) : (
                    <div className="space-y-4">{children}</div>
                )}
            </div>
        </PageProvider>
    );
}
