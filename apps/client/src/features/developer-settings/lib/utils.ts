import type { CodeEditorSettings, CodeEditorTheme } from '../providers/developer-settings-provider';
import { EDITOR_THEMES, FONT_FAMILIES } from './data';

export function isEditorTheme(value: string): value is CodeEditorTheme {
    return EDITOR_THEMES.some(option => option.value === value);
}

export function isFontFamily(value: string): value is CodeEditorSettings['fontFamily'] {
    return FONT_FAMILIES.some(option => option.value === value);
}
