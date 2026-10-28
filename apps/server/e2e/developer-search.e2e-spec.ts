import { FilterGroupOperator, RelatedSnippetsDtoType, SearchDtoType } from '@snippetly/common/dto';
import { transformInputToSearchParams } from '@snippetly/common/lib';
import { mergeConfig } from '@snippetly/server';
import { afterAll, beforeAll, describe, expect, it } from 'vitest';
import { getE2ETestSetupTimeout } from '../../e2e-common/e2e-common-utils';
import { initialData } from '../../e2e-common/e2e-initial-data';
import { testConfig } from '../../e2e-common/test-config';
import { createTestEnvironment } from './support/create-test-environment';
import { TestEmailTransporter } from './utils/test-email-transporter.strategy';
import { TestPasswordValidationStrategy } from './utils/test-password-validation.strategy';

const searchInitialData = {
    ...initialData,
    collections: initialData.collections.map((collection, index) =>
        index === 0 ? { ...collection, tags: ['hooks', 'react'] } : collection,
    ),
    snippets: initialData.snippets.map((snippet, index) => ({
        ...snippet,
        collectionId: 'react-hooks',
        ...(index === 0 ? { tags: ['hooks', 'react'] } : index === 1 ? { tags: ['hooks'] } : {}),
    })),
};

describe('Developer Search', () => {
    const { server, developerClient } = createTestEnvironment(
        mergeConfig(
            {
                auth: {
                    passwordValidationStrategy: new TestPasswordValidationStrategy(),
                },
                system: {
                    email: {
                        emailTransporterStrategy: new TestEmailTransporter(options =>
                            Promise.resolve(options),
                        ),
                    },
                },
            },
            testConfig(),
        ),
    );

    beforeAll(async () => {
        await server.init({
            initialData: searchInitialData,
            developerCount: 2,
            logging: false,
        });
    }, getE2ETestSetupTimeout());

    afterAll(async () => {
        await server.destroy();
    });

    it('searches public snippets, collections, developers, and their tags', async () => {
        const query = transformInputToSearchParams({ term: 'hooks', take: 100 });
        const response = await developerClient.fetch(`/search?${query.toString()}`);

        expect(response.status, await response.clone().text()).toBe(200);
        const result = (await response.json()) as SearchDtoType['output'];

        expect(
            result.snippets.items.some(item => item.name === 'test snippet 1'),
            JSON.stringify(result),
        ).toBe(true);
        expect(result.collections.items.some(item => item.slug === 'react-hooks')).toBe(true);
        expect(result.developers.items.length).toBeGreaterThan(0);
        expect(result.tagCounts.some(tag => tag.value === 'hooks' && tag.count > 0)).toBe(true);
    });

    it('filters all result groups by tags using the requested operator', async () => {
        const query = transformInputToSearchParams({
            tags: { values: ['hooks', 'react'], operator: FilterGroupOperator.AND },
            take: 100,
        });
        const response = await developerClient.fetch(`/search?${query.toString()}`);

        expect(response.status).toBe(200);
        const result = (await response.json()) as SearchDtoType['output'];

        expect(result.snippets.items.map(item => item.name)).toContain('test snippet 1');
        expect(result.snippets.items.map(item => item.name)).not.toContain('test snippet 2');
        expect(result.collections.items.map(item => item.slug)).toContain('react-hooks');
    });

    it('supports OR tag filtering', async () => {
        const query = transformInputToSearchParams({
            tags: { values: ['hooks', 'react'], operator: FilterGroupOperator.OR },
            take: 100,
        });
        const response = await developerClient.fetch(`/search?${query.toString()}`);

        expect(response.status).toBe(200);
        const result = (await response.json()) as SearchDtoType['output'];

        expect(result.snippets.items.map(item => item.name)).toContain('test snippet 1');
        expect(result.snippets.items.map(item => item.name)).toContain('test snippet 2');
    });

    it('returns at most five related snippets using shared tags and searchable content', async () => {
        const sourceSnippet = server.state.snippets.find(snippet => snippet.slug === 'test-snippet-1');
        if (!sourceSnippet) throw new Error('Related-snippet test source was not initialized');

        const response = await developerClient.fetch(`/snippets/${sourceSnippet.id}/related`);
        expect(response.status, await response.clone().text()).toBe(200);

        const result = (await response.json()) as RelatedSnippetsDtoType['output'];
        expect(result.items).toHaveLength(5);
        expect(result.items.map(snippet => snippet.id)).not.toContain(sourceSnippet.id);
        expect(result.items.map(snippet => snippet.name)).toContain('test snippet 2');
    });

    it('does not return private collections', async () => {
        const query = transformInputToSearchParams({ term: 'docker', take: 100 });
        const response = await developerClient.fetch(`/search?${query.toString()}`);

        expect(response.status).toBe(200);
        const result = (await response.json()) as SearchDtoType['output'];

        expect(result.collections.items.some(item => item.slug === 'docker-compose')).toBe(false);
    });
});
