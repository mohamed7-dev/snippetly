import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowRightIcon, WifiOffIcon } from 'lucide-react';

export function LandingPageCta() {
    return (
        <section className="px-4 pb-20 sm:px-6 sm:pb-24 lg:px-8">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="relative isolate mx-auto max-w-5xl overflow-hidden rounded-3xl border border-primary/15 bg-primary/5 px-6 py-12 text-center sm:px-12 sm:py-16">
                    <div className="pointer-events-none absolute -right-16 -top-24 -z-10 h-64 w-64 rounded-full bg-primary/10 blur-3xl" />
                    <div className="mx-auto flex max-w-2xl flex-col items-center">
                        <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                            <WifiOffIcon className="h-5 w-5" />
                        </span>
                        <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight lg:text-4xl">
                            Your next great snippet starts here.
                        </h2>
                        <p className="mb-8 text-lg leading-7 text-muted-foreground">
                            Build a library that works the way you do—online, offline, and everywhere in
                            between.
                        </p>
                        <Button size="lg" className="px-7" asChild>
                            <Link to="/register-account">
                                Get started
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                </div>
            </div>
        </section>
    );
}
