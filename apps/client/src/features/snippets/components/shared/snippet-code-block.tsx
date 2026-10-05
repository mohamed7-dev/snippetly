import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiSuccess } from '@/lib/api-client';
import { registerLanguage } from '@/lib/highlightjs';
import type { FindOneSnippetDtoType } from '@snippetly/common/dto';
import React from 'react';
import { CopyButton } from './copy-button';

export function SnippetCodeBlock({
    snippet,
}: {
    snippet: Pick<ApiSuccess<FindOneSnippetDtoType['output']>, 'id' | 'language' | 'code' | 'name'>;
}) {
    // TODO: render code as readonly in the code editor
    // Display the code editor in fullscreen toggle button, or in an alert dialog
    const codeRef = React.useRef<HTMLElement | null>(null);

    // Dynamically import highlight.js core and register only the needed language
    React.useEffect(() => {
        let cancelled = false;
        (async () => {
            try {
                const lang = (snippet.language ?? 'plaintext').toLowerCase();
                const hljs = (await import('highlight.js/lib/core')).default;

                // Dynamically register only the language we need
                await registerLanguage(hljs, lang);

                if (!cancelled && codeRef.current) {
                    hljs.highlightElement(codeRef.current);
                }
            } catch {
                // no-op; render plain code if highlighting fails
            }
        })();
        return () => {
            cancelled = true;
        };
    }, [snippet.language, snippet.code]);

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="font-heading text-lg">Code</CardTitle>
                    <CopyButton code={snippet.code} />
                </div>
            </CardHeader>
            <CardContent className="p-2">
                <div className="bg-muted/50 rounded-lg border overflow-hidden">
                    <div className="flex items-center justify-between px-4 py-2 bg-muted border-b">
                        <span className="text-sm font-mono text-muted-foreground">
                            {snippet.name.toLowerCase().replace(/\s+/g, '-')}.{snippet.language}
                        </span>
                        <div className="flex items-center gap-2">
                            <div className="h-3 w-3 rounded-full bg-destructive"></div>
                            <div className="h-3 w-3 rounded-full bg-secondary"></div>
                            <div className="h-3 w-3 rounded-full bg-primary"></div>
                        </div>
                    </div>
                    <div className="p-4 overflow-x-auto">
                        <pre className="font-mono text-sm text-foreground tracking-normal leading-5 whitespace-pre-wrap">
                            <code
                                ref={codeRef}
                                className={`language-${snippet.language} border border-gray-500 px-4 py-3 h-96 subpixel-antialiased`}
                            >
                                {snippet.code}{' '}
                            </code>
                        </pre>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
