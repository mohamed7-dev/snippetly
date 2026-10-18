import 'reflect-metadata';
import type { Request } from 'express';
import ICU from 'i18next-icu';
import i18next from 'i18next';
import { beforeEach, describe, expect, it } from 'vitest';
import { EntityNotFoundError } from '../../common/errors/errors';
import translations from './dictionaries/en.json';
import { I18nService } from './i18n.service';

describe('I18nService', () => {
    let request: Request;

    beforeEach(async () => {
        const translator = i18next.createInstance();
        await translator.use(ICU).init({
            lng: 'en',
            resources: {
                en: {
                    translation: translations,
                },
            },
            nsSeparator: false,
        });

        request = { t: translator.t.bind(translator) } as unknown as Request;
    });

    it('interpolates entity names and IDs using the ICU dictionary', () => {
        const error = new EntityNotFoundError({
            entityName: 'Collection',
            entityId: 'pending-collection-id',
        });

        const translated = new I18nService().translateError(error, request);

        expect(translated.message).toBe('Collection with ID pending-collection-id could not be found.');
        expect(error.message).toBe('errors.entity_with_id_not_found');
        expect(error.variables).toEqual({
            entityName: 'Collection',
            entityId: 'pending-collection-id',
        });
    });

    it('interpolates legacy double-brace placeholders returned by a stale translator', () => {
        const error = new EntityNotFoundError({
            entityName: 'Collection',
            entityId: 'pending-collection-id',
        });
        const staleRequest = {
            t: () => '{{entityName}} with ID {{entityId}} could not be found.',
        } as unknown as Request;

        const translated = new I18nService().translateError(error, staleRequest);

        expect(translated.message).toBe('Collection with ID pending-collection-id could not be found.');
    });
});
