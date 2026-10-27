import { IdentifierChangeCard } from '@/features/auth/components/sections/identifier-change-card';
import { createFileRoute } from '@tanstack/react-router';
import z from 'zod';

export const Route = createFileRoute('/(auth)/_auth-layout/identifier-change')({
    component: IdentifierChangePage,
    validateSearch: z.object({
        token: z.string().catch(''),
    }),
});

function IdentifierChangePage() {
    return (
        <div className="flex items-center justify-center p-2">
            <IdentifierChangeCard />
        </div>
    );
}
