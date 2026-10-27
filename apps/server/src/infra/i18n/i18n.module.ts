import { LANGUAGE_CODE_QUERY_NAME } from '@snippetly/common/lib';
import i18next from 'i18next';
import BackendFS from 'i18next-fs-backend';
import i18nextMiddleware from 'i18next-http-middleware';
import ICU from 'i18next-icu';
import path from 'node:path';
import { OnApplicationBootstrap } from '../../common/types/lifecycle-hooks';
import { Module } from '../ioc-container/module.decorator';
import { I18nService } from './i18n.service';

@Module({
    providers: [I18nService],
    exports: [I18nService],
})
export class I18nModule implements OnApplicationBootstrap {
    async onApplicationBootstrap(): Promise<void> {
        await i18next
            .use(i18nextMiddleware.LanguageDetector)
            .use(BackendFS)
            .use(ICU)
            .init({
                preload: ['en'],
                fallbackLng: 'en',
                detection: {
                    lookupQuerystring: LANGUAGE_CODE_QUERY_NAME,
                },
                backend: {
                    loadPath: path.join(__dirname, 'dictionaries/{{lng}}.json'),
                    jsonIndent: 2,
                },
                nsSeparator: false,
            });
    }
}
