import { APP_NAME } from '@snippetly/common/lib';
import { CheckIcon, Code2Icon, EyeIcon, PaletteIcon } from 'lucide-react';

export function LandingPageDemo() {
    return (
        <section id="demo" className="py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-12 max-w-2xl text-center sm:mb-14">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                        Your workspace, your way
                    </p>
                    <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight lg:text-4xl">
                        A little more focus. A lot more flow.
                    </h2>
                    <p className="text-lg leading-7 text-muted-foreground">
                        Tune the editor to your taste, keep code neatly grouped, and make the most of
                        {` ${APP_NAME}`} whether you are online or away.
                    </p>
                </div>

                <div className="mx-auto grid max-w-5xl overflow-hidden rounded-2xl border border-border bg-card shadow-xl shadow-primary/5 lg:grid-cols-[1.2fr_0.8fr]">
                    <div className="min-w-0 border-b border-border lg:border-b-0 lg:border-r">
                        <div className="flex items-center justify-between border-b border-border px-5 py-4">
                            <div className="flex items-center gap-2 text-sm font-medium">
                                <Code2Icon className="h-4 w-4 text-primary" />
                                editor.ts
                            </div>
                            <div className="flex items-center gap-1.5">
                                <span className="h-2.5 w-2.5 rounded-full bg-red-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" />
                                <span className="h-2.5 w-2.5 rounded-full bg-green-400" />
                            </div>
                        </div>
                        <div className="overflow-x-auto p-5 font-mono text-xs leading-7 sm:p-7 sm:text-sm">
                            <div className="text-muted-foreground">1&nbsp;&nbsp; // Keep the good bits</div>
                            <div>
                                <span className="text-primary">2&nbsp;&nbsp; const</span>{' '}
                                <span className="text-foreground">greeting = (name: string) =&gt; {'{'}</span>
                            </div>
                            <div className="text-foreground">
                                3&nbsp;&nbsp;&nbsp;&nbsp; return `Hello, ${'{'}name{'}'}!`;
                            </div>
                            <div className="text-foreground">4&nbsp;&nbsp; {'}'}</div>
                            <div className="text-muted-foreground">5</div>
                            <div>
                                <span className="text-primary">6&nbsp;&nbsp; export default</span>{' '}
                                <span className="text-foreground">greeting;</span>
                            </div>
                        </div>
                    </div>
                    <div className="flex flex-col justify-between gap-8 p-6 sm:p-8">
                        <div>
                            <p className="text-sm font-medium text-muted-foreground">Editor preferences</p>
                            <div className="mt-4 space-y-3">
                                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                                    <span className="flex items-center gap-2 text-sm">
                                        <PaletteIcon className="h-4 w-4 text-primary" />
                                        Syntax theme
                                    </span>
                                    <span className="text-sm text-muted-foreground">One Dark</span>
                                </div>
                                <div className="flex items-center justify-between rounded-lg border border-border px-3 py-2.5">
                                    <span className="flex items-center gap-2 text-sm">
                                        <EyeIcon className="h-4 w-4 text-primary" />
                                        Appearance
                                    </span>
                                    <span className="text-sm text-muted-foreground">System</span>
                                </div>
                            </div>
                        </div>
                        <div className="rounded-xl bg-primary/5 p-4">
                            <div className="flex items-center gap-2 font-medium">
                                <CheckIcon className="h-4 w-4 text-primary" />
                                Made for your workflow
                            </div>
                            <p className="mt-2 text-sm leading-6 text-muted-foreground">
                                Keep your editor comfortable and your snippets ready, even without a
                                connection.
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}
