import { Button } from '@/components/ui/button';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { APP_NAME } from '@snippetly/common/lib';
import { Link } from '@tanstack/react-router';
import { ArrowLeftIcon, Code2Icon } from 'lucide-react';
import React from 'react';

type AuthCardProps = {
    children: React.ReactNode;
    cardDescription: string;
    cardTitle: string;
};
export function AuthCard({ cardDescription, cardTitle, children }: AuthCardProps) {
    return (
        <div className="w-full max-w-md">
            <div className="mb-8">
                <Button variant="ghost" size="sm" asChild>
                    <Link to="/" className="flex items-center gap-2">
                        <ArrowLeftIcon className="h-4 w-4" />
                        Back to home
                    </Link>
                </Button>
            </div>

            <Card className="border-border">
                <CardHeader className="text-center gap-4">
                    <div className="flex gap-4 items-center">
                        <Link to="/" className="flex items-center justify-center gap-2">
                            <Code2Icon className="h-8 w-8 text-primary" />
                            <span className="font-heading font-bold text-xl">{APP_NAME}</span>
                        </Link>
                        <span className="text-2xl">{'/'}</span>
                        <CardTitle className="font-heading text-2xl">{cardTitle}</CardTitle>
                    </div>
                    <CardDescription>{cardDescription}</CardDescription>
                </CardHeader>
                {children}
            </Card>
        </div>
    );
}
