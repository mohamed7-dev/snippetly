import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { ApiSuccess } from '@/lib/api-client';
import type { FindOneSnippetDtoType } from '@snippetly/common/dto';

export function SnippetNoteBlock({
    snippet,
}: {
    snippet: Pick<ApiSuccess<FindOneSnippetDtoType['output']>, 'id' | 'note'>;
}) {
    if (!snippet.note) return null;

    // TODO: render note as markdown
    return (
        <Card>
            <CardHeader>
                <CardTitle className="font-heading text-lg">Notes</CardTitle>
            </CardHeader>
            <CardContent>
                <p className="text-base">{snippet.note}</p>
            </CardContent>
        </Card>
    );
}
