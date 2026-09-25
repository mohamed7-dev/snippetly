import { InitialDataInput, type Collection, type Developer, type Snippet } from '@snippetly/server';

export interface TestServerState {
    developers: Developer[];
    collections: Collection[];
    snippets: Snippet[];
}

export interface TestServerOptions {
    /**
     * @description
     * An object containing non-product data which is used to populate the database.
     */
    initialData: InitialDataInput;
    /**
     * @description
     * The number of fake Customers to populate into the database.
     *
     * @default 10
     */
    developerCount?: number;
    /**
     * @description
     * Set this to `true` to log some information about the database population process.
     *
     * @default false
     */
    logging?: boolean;
}
