import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Link } from '@tanstack/react-router';
import { ArrowDownIcon, ArrowRightIcon, Code2Icon, SearchCodeIcon, WifiOffIcon } from 'lucide-react';

export function LandingPageHero() {
    return (
        <section className="relative isolate overflow-hidden border-b border-border bg-gradient-to-b from-primary/5 via-background to-background py-20 sm:py-28 lg:py-32">
            <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 mx-auto h-96 max-w-5xl rounded-full bg-primary/10 blur-3xl" />
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto max-w-4xl text-center">
                    <Badge variant="secondary" className="mb-7 gap-2 rounded-full px-4 py-1.5">
                        <WifiOffIcon className="h-4 w-4" />
                        Your code library, even offline
                    </Badge>
                    <h1 className="mb-6 text-balance font-heading text-5xl font-bold tracking-tight sm:text-6xl lg:text-7xl">
                        Keep your best code
                        <span className="block text-primary"> close at hand.</span>
                    </h1>
                    <p className="mx-auto mb-9 max-w-2xl text-pretty text-lg leading-8 text-muted-foreground sm:text-xl">
                        A thoughtful home for your snippets. Write in a focused code editor, shape your
                        library with collections and tags, and take it with you offline.
                    </p>
                    <div className="flex flex-col justify-center gap-3 sm:flex-row">
                        <Button size="lg" className="px-7" asChild>
                            <Link to="/register-account">
                                Build your library
                                <ArrowRightIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                        <Button size="lg" variant="outline" className="bg-background/70 px-7" asChild>
                            <Link to="/discover" search={{ tab: 'snippets' }}>
                                Explore snippets
                                <SearchCodeIcon className="ml-2 h-4 w-4" />
                            </Link>
                        </Button>
                    </div>
                    <div className="mt-16 overflow-hidden rounded-2xl border border-border/80 bg-card/80 text-left shadow-2xl shadow-primary/5 backdrop-blur sm:mt-20">
                        <div className="flex items-center justify-between border-b border-border px-4 py-3 sm:px-6">
                            <div className="flex items-center gap-2">
                                <Code2Icon className="h-4 w-4 text-primary" />
                                <span className="text-sm font-medium">A calmer place for code</span>
                            </div>
                            <span className="rounded-full bg-green-500/10 px-2.5 py-1 text-xs font-medium text-green-700 dark:text-green-400">
                                Saved to your library
                            </span>
                        </div>
                        <div className="grid md:grid-cols-[1fr_240px]">
                            <div className="overflow-x-auto p-5 font-mono text-xs leading-7 sm:p-7 sm:text-sm">
                                <div className="text-muted-foreground">
                                    1&nbsp;&nbsp; // A tiny helper, ready when you need it
                                </div>
                                <div>
                                    <span className="text-primary">2&nbsp;&nbsp; export function</span>{' '}
                                    <span className="text-foreground">groupBy(items, key) {'{'}</span>
                                </div>
                                <div className="text-foreground">
                                    3&nbsp;&nbsp;&nbsp;&nbsp; return items.reduce((groups, item) =&gt; {'{'}
                                </div>
                                <div className="text-foreground">
                                    4&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (groups[item[key]] ??=
                                    []).push(item);
                                </div>
                                <div className="text-foreground">
                                    5&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; return groups;
                                </div>
                                <div className="text-foreground">
                                    6&nbsp;&nbsp;&nbsp;&nbsp; {'}'}, {'{}'});
                                </div>
                                <div className="text-foreground">7&nbsp;&nbsp; {'}'}</div>
                            </div>
                            <aside className="border-t border-border bg-muted/40 p-5 md:border-l md:border-t-0">
                                <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
                                    In your toolkit
                                </p>
                                <p className="mt-3 font-semibold">Array utilities</p>
                                <div className="mt-4 flex flex-wrap gap-2">
                                    <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                                        JavaScript
                                    </span>
                                    <span className="rounded-md border border-border bg-background px-2 py-1 text-xs text-muted-foreground">
                                        helpers
                                    </span>
                                </div>
                                <div className="mt-6 flex items-center gap-2 text-xs text-muted-foreground">
                                    <WifiOffIcon className="h-3.5 w-3.5 text-primary" />
                                    Available offline
                                </div>
                            </aside>
                        </div>
                    </div>
                    <a
                        href="#features"
                        className="mt-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                        Get to know your toolkit
                        <ArrowDownIcon className="h-4 w-4" />
                    </a>
                </div>
            </div>
        </section>
    );
}
