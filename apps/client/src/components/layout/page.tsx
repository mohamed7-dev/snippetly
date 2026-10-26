import { cn } from '@/lib/utils';
import React from 'react';
import { type UseFormReturn } from 'react-hook-form';
import { PageProvider } from '../providers/page-provider';
import { Form } from '../ui/form';
import { PageActionBar } from './page-action-bar';

interface PageProps extends React.ComponentProps<'div'> {
    form?: UseFormReturn<any>;
    submitHandler?: any;
    entity?: any;
    pageHeaderClassName?: string;
}

export function Page(props: PageProps) {
    const { children, entity, submitHandler, form, pageHeaderClassName, ...restProps } = props;

    const childrenArray = React.Children.toArray(children);
    const pageTitle = childrenArray.find(child => isPageTitle(child));
    const pageDescription = childrenArray.find(child => isPageDescription(child));
    const pageActionBar = childrenArray.find(child => isPageActionBar(child));
    const pageContent = childrenArray.filter(
        child => !isPageTitle(child) && !isPageDescription(child) && !isPageActionBar(child),
    );

    const pageHeader = (
        <header className={cn('space-y-2', pageHeaderClassName)}>
            <div className="min-w-0 flex items-center justify-between gap-2">
                {pageTitle ?? ''}
                {pageActionBar}
            </div>
            {pageDescription && <div className="shrink-0">{pageDescription}</div>}
        </header>
    );
    return (
        <PageProvider entity={entity} form={form}>
            <div className={cn(restProps.className)} {...restProps}>
                {form ? (
                    <Form {...form}>
                        <form onSubmit={submitHandler} className="space-y-6">
                            {pageHeader}
                            {pageContent}
                        </form>
                    </Form>
                ) : (
                    <div className="space-y-6">
                        {pageHeader}
                        {pageContent}
                    </div>
                )}
            </div>
        </PageProvider>
    );
}

export function PageTitle({ children }: { children: React.ReactNode }) {
    return <h1 className="text-xl md:text-2xl font-heading font-bold capitalize">{children}</h1>;
}

export function PageDescription({ children }: { children: React.ReactNode }) {
    return <p className="text-sm md:text-base text-muted-foreground">{children}</p>;
}

// UTILS //

export function isOfType(el: unknown, type: React.FunctionComponent<any>): boolean {
    if (React.isValidElement(el)) {
        const elTypeName = typeof el.type === 'string' ? el.type : (el.type as React.FunctionComponent).name;
        return elTypeName === type.name;
    }
    return false;
}

function isPageTitle(child: unknown) {
    return isOfType(child, PageTitle);
}

function isPageDescription(child: unknown) {
    return isOfType(child, PageDescription);
}

function isPageActionBar(child: unknown) {
    return isOfType(child, PageActionBar);
}
