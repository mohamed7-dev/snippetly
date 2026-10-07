import React from 'react';
import { RichTextEditor } from '../shared/rich-text-editor';

interface RichTextInputProps {
    value: string;
    isDisabled?: boolean;
    onChange: (value: string) => void;
    placeholder?: string;
}

export function RichTextInput({ value, onChange, isDisabled, placeholder }: RichTextInputProps) {
    const strippedPlaceholder = React.useMemo(
        () =>
            placeholder
                ? new DOMParser().parseFromString(placeholder, 'text/html').body.textContent?.trim() ||
                  undefined
                : undefined,
        [placeholder],
    );

    return (
        <RichTextEditor
            value={value}
            onValueChange={onChange}
            isDisabled={isDisabled}
            placeholder={strippedPlaceholder}
        />
    );
}
