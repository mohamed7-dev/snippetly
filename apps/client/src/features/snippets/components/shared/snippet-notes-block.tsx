import { RichTextViewer } from '@/components/shared/rich-text-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiSuccess } from '@/lib/api-client';
import type { FindOneSnippetDtoType } from '@snippetly/common/dto';

export function SnippetNoteBlock({
    snippet,
}: {
    snippet: Pick<ApiSuccess<FindOneSnippetDtoType['output']>, 'id' | 'note'>;
}) {
    if (!snippet.note) return null;

    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-heading text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent className="overflow-hidden">
                <RichTextViewer content={snippet.note} />
            </CardContent>
        </Card>
    );
}
