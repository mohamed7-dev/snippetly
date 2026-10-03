import { LandingHeader } from '@/features/app-shell/components/landing/header';
import { LandingPageCta } from '@/features/landing/components/landing-page-cta';
import { LandingPageDemo } from '@/features/landing/components/landing-page-demo';
import { LandingPageFeatures } from '@/features/landing/components/landing-page-features';
import { LandingPageFooter } from '@/features/landing/components/landing-page-footer';
import { LandingPageHero } from '@/features/landing/components/landing-page-hero';
import { LandingPageTestimonials } from '@/features/landing/components/landing-page-testimonials';
import { APP_NAME } from '@snippetly/common/lib';
import { createFileRoute } from '@tanstack/react-router';
import React from 'react';

export const Route = createFileRoute('/(public)/')({
    component: LandingPage,
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
        <React.Fragment>
            <LandingHeader />
            <main>
                {/* Hero Section */}
                <LandingPageHero />

                {/* Features Section */}
                <LandingPageFeatures />

                {/* Demo Section */}
                <LandingPageDemo />

                {/* Testimonials */}
                <LandingPageTestimonials />

                {/* CTA Section */}
                <LandingPageCta />

                {/* Footer */}
                <LandingPageFooter />
            </main>
        </React.Fragment>
    );
}
