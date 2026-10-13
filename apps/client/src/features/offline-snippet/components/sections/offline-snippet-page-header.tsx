import { Button } from '@/components/ui/button';
import { HeaderWrapper } from '@/features/app-shell/components/header-wrapper';
import { Logo } from '@/features/app-shell/components/logo';
import { Link } from '@tanstack/react-router';

export function OfflineSnippetPageHeader() {
    return (
        <HeaderWrapper className="gap-4">
            <Logo />
            <Button variant="link" asChild>
                <Link to="/offline">Back to Offline Library</Link>
            </Button>
        </HeaderWrapper>
    );
}
