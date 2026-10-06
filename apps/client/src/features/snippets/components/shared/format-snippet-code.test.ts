import { describe, expect, it } from 'vitest';
import { formatSnippetCode } from './format-snippet-code';

describe('formatSnippetCode', () => {
    it('formats JavaScript using tabs', async () => {
        await expect(formatSnippetCode('const value={\nnested:true\n}', 'javascript')).resolves.toBe(
            'const value = {\n\tnested: true,\n};\n',
        );
    });

    it('formats JSON', async () => {
        await expect(formatSnippetCode('{\n"value":1\n}', 'json')).resolves.toBe('{\n\t"value": 1\n}\n');
    });

    it('reports languages that do not have a formatter', async () => {
        await expect(formatSnippetCode('print("hello")', 'python')).rejects.toThrow(
            'Formatting is not supported for python.',
        );
    });
});
