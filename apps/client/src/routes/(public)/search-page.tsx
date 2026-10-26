import { SearchBar } from '@/features/search/components/search-bar';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/(public)/search-page')({
    component: SearchInputPage,
    head: () => ({
        meta: [{ title: 'Search' }],
    }),
});

function SearchInputPage() {
    return (
        <main className="container mx-auto flex min-h-[calc(100dvh-8rem)] max-w-2xl items-start px-4 pt-12 lg:min-h-[calc(100dvh-5rem)] lg:pt-16">
            <SearchBar className="w-full" />
        </main>
    );
}
