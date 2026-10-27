import { keepPreviousData, QueryClient, QueryClientProvider } from '@tanstack/react-query';

export const queryClient = new QueryClient({
    defaultOptions: {
        queries: {
            // Prevent flickering issue when refetching data which has its query key
            // persisted into the url, and changes on each keystroke
            placeholderData: keepPreviousData,
            refetchOnWindowFocus: false,
        },
    },
});

type TanstackQueryProviderProps = {
    children: React.ReactNode;
};
export function TanstackQueryProvider({ children }: TanstackQueryProviderProps) {
    return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
