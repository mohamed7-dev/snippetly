import { LoaderPinwheelIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';

type LoadingButtonProps = {
    isLoading: boolean;
} & React.ComponentProps<typeof Button>;

export function LoadingButton({ isLoading, children, ...rest }: LoadingButtonProps) {
    return (
        <Button {...rest} disabled={isLoading || rest.disabled}>
            {isLoading && <LoaderPinwheelIcon />}
            {!isLoading && children}
        </Button>
    );
}
