import { Logger } from '@snippetly/server';
import fs from 'fs/promises';
import { LoggerContextName } from './generate';

const LANGUAGE_CODES = {
    Afrikaans: 'af',
    Akan: 'ak',
    Albanian: 'sq',
    Amharic: 'am',
    Arabic: 'ar',
    Armenian: 'hy',
    Assamese: 'as',
    Azerbaijani: 'az',
    Bambara: 'bm',
    Bangla: 'bn',
    Basque: 'eu',
    Belarusian: 'be',
    Bosnian: 'bs',
    Breton: 'br',
    Bulgarian: 'bg',
    Burmese: 'my',
    Catalan: 'ca',
    Chechen: 'ce',
    Chinese: 'zh',
    SimplifiedChinese: 'zh_Hans',
    TraditionalChinese: 'zh_Hant',
    English: 'en',
    AustralianEnglish: 'en_AU',
    CanadianEnglish: 'en_CA',
    BritishEnglish: 'en_GB',
    AmericanEnglish: 'en_US',
    French: 'fr',
    CanadianFrench: 'fr_CA',
    SwissFrench: 'fr_CH',
    German: 'de',
    AustrianGerman: 'de_AT',
    SwissHighGerman: 'de_CH',
    Spanish: 'es',
    EuropeanSpanish: 'es_ES',
    MexicanSpanish: 'es_MX',
    Portuguese: 'pt',
    BrazilianPortuguese: 'pt_BR',
    EuropeanPortuguese: 'pt_PT',
    Italian: 'it',
    Japanese: 'ja',
    Korean: 'ko',
    Russian: 'ru',
    Turkish: 'tr',
    Ukrainian: 'uk',
    Vietnamese: 'vi',
    ArabicSaudi: 'ar_SA',
    Zulu: 'zu',
} as const;

export async function generateLanguageCodeEnum(outputPath: string) {
    const enumValues = Object.entries(LANGUAGE_CODES)
        .map(([key, value]) => `  ${key} = "${value}",`)
        .join('\n');

    const unionValues = Object.values(LANGUAGE_CODES)
        .map(v => `"${v}"`)
        .join(' | ');

    const file = `/* eslint-disable */
/**
 * ---------------------------------------------------------
 * ⚠️ AUTO-GENERATED FILE — DO NOT EDIT
 * ---------------------------------------------------------
 */

export const LanguageCodes = ${JSON.stringify(LANGUAGE_CODES, null, 2)} as const;

export enum LanguageCode {
${enumValues}
}

export type LanguageCodesUnion = ${unionValues};

`;

    try {
        await fs.writeFile(outputPath, file);
        Logger.info('LanguageCode enum generated successfully', LoggerContextName);
    } catch (error) {
        Logger.error(
            `Failed to generate LanguageCode enum, ${error instanceof Error ? error.message : JSON.stringify(error)}`,
            LoggerContextName,
        );
    }
}
