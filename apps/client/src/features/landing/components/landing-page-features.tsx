import { Card, CardContent } from '@/components/ui/card';
import { APP_NAME } from '@snippetly/common/lib';
import {
    Code2Icon,
    CompassIcon,
    FolderHeartIcon,
    PaletteIcon,
    RefreshCwIcon,
    WifiOffIcon,
} from 'lucide-react';

const features = [
    {
        icon: Code2Icon,
        title: 'A code editor that feels at home',
        description:
            'Write and refine snippets in a focused editor with syntax highlighting, language selection, and settings that make the workspace yours.',
    },
    {
        icon: PaletteIcon,
        title: 'Make it yours',
        description:
            'Choose a light, dark, or system appearance, then pick the syntax theme, font, and size that feel right for your code.',
    },
    {
        icon: FolderHeartIcon,
        title: 'A library that stays organized',
        description:
            'Group snippets into collections, add tags, and use search to get back to the useful detail without digging.',
    },
    {
        icon: WifiOffIcon,
        title: 'Keep working offline',
        description:
            'Save snippets and collections for offline access. Your saved library stays with you when your connection does not.',
    },
    {
        icon: RefreshCwIcon,
        title: 'Pick up where you left off',
        description:
            'Create and update snippets while offline. Changes wait safely on your device and sync when you are back online.',
    },
    {
        icon: CompassIcon,
        title: 'Find a spark in Discover',
        description:
            'Browse public snippets, save the ones you like, and share useful pieces of your own library with others.',
    },
];

export function LandingPageFeatures() {
    return (
        <section id="features" className="border-b border-border bg-muted/30 py-20 sm:py-24">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8">
                <div className="mx-auto mb-14 max-w-2xl text-center sm:mb-16">
                    <p className="mb-3 text-sm font-semibold uppercase tracking-[0.18em] text-primary">
                        Made for your everyday flow
                    </p>
                    <h2 className="mb-4 font-heading text-3xl font-bold tracking-tight lg:text-4xl">
                        Everything your code library needs
                    </h2>
                    <p className="text-lg leading-7 text-muted-foreground">
                        {APP_NAME} keeps your snippets easy to write, easy to find, and ready wherever you
                        are.
                    </p>
                </div>

                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {features.map(({ icon: Icon, title, description }) => (
                        <Card
                            key={title}
                            className="group border-border/80 bg-card/80 transition-all duration-200 hover:-translate-y-1 hover:border-primary/30 hover:shadow-lg hover:shadow-primary/5"
                        >
                            <CardContent className="p-6 sm:p-7">
                                <div className="mb-5 flex h-11 w-11 items-center justify-center rounded-xl bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                                    <Icon className="h-5 w-5" />
                                </div>
                                <h3 className="mb-2 font-heading text-lg font-semibold">{title}</h3>
                                <p className="text-sm leading-6 text-muted-foreground">{description}</p>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            </div>
        </section>
    );
}
