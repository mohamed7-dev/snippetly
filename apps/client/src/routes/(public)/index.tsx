import { LandingPageCta } from '@/features/landing/components/landing-page-cta';
import { LandingPageDemo } from '@/features/landing/components/landing-page-demo';
import { LandingPageFeatures } from '@/features/landing/components/landing-page-features';
import { LandingPageFooter } from '@/features/landing/components/landing-page-footer';
import { LandingPageHero } from '@/features/landing/components/landing-page-hero';
import { isOfflineDashboardAvailable } from '@/features/offline-snippet/lib/common';
import { APP_NAME } from '@snippetly/common/lib';
import { createFileRoute, redirect } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/')({
    component: LandingPage,
    beforeLoad: async ({ context: { auth } }) => {
        const status =
            auth.status === 'initial' || auth.status === 'verifying'
                ? await auth.waitForAuthResolution()
                : auth.status;

        const shouldRedirect = status === 'authenticated' || isOfflineDashboardAvailable();
        if (shouldRedirect) {
            throw redirect({ to: '/dashboard' });
        }
    },
    head: () => {
        return {
            meta: [
                {
                    title: APP_NAME,
                },
            ],
        };
    },
});

function LandingPage() {
    return (
        <main>
            {/* Hero Section */}
            <LandingPageHero />

            {/* Features Section */}
            <LandingPageFeatures />

            {/* Demo Section */}
            <LandingPageDemo />

            {/* CTA Section */}
            <LandingPageCta />

            {/* Footer */}
            <LandingPageFooter />
        </main>
    );
}
