import React from 'react';

export interface PageContextType {
    entity?: any;
    form?: any;
}

export const PageContext = React.createContext<PageContextType | undefined>(undefined);

interface PageProviderProps extends PageContextType {
    children: React.ReactNode;
}

export function PageProvider({ children, entity, form }: PageProviderProps) {
    const contextValue = React.useMemo(() => {
        return {
            entity,
            form,
        };
    }, [entity, form]);
    return <PageContext.Provider value={contextValue}>{children}</PageContext.Provider>;
}
