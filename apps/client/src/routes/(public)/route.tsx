import { PublicLayout } from '@/features/app-shell/components/public/public-layout';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)')({
    component: PublicLayout,
});
