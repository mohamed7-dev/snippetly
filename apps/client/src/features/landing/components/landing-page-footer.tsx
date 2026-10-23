import { APP_NAME } from '@snippetly/common/lib';
import { Link } from '@tanstack/react-router';
import { Code2Icon } from 'lucide-react';

export function LandingPageFooter() {
    return (
        <footer className="border-t border-border bg-muted/20">
            <div className="container mx-auto px-4 py-10 sm:px-6 lg:px-8">
                <div className="flex flex-col gap-8 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <div className="mb-3 flex items-center gap-2">
                            <Code2Icon className="h-5 w-5 text-primary" />
                            <span className="font-heading text-base font-bold">{APP_NAME}</span>
                        </div>
                        <p className="max-w-sm text-sm leading-6 text-muted-foreground">
                            A considered home for the code you want to keep.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 text-sm text-muted-foreground">
                        <Link to="." hash="features" className="transition-colors hover:text-foreground">
                            Features
                        </Link>
                        <Link to="/discover" className="transition-colors hover:text-foreground">
                            Discover
                        </Link>
                        <Link to="/offline" className="transition-colors hover:text-foreground">
                            Offline library
                        </Link>
                    </div>
                </div>

                <div className="mt-8 border-t border-border pt-6 text-sm text-muted-foreground">
                    <p>
                        &copy; {new Date().getFullYear()} {APP_NAME}
                    </p>
                </div>
            </div>
        </footer>
    );
}
