import { useIsOnline } from '../../hooks/use-is-online';

interface OnlineGuardProps {
    children: React.ReactNode;
}

export function OnlineGuard({ children }: OnlineGuardProps) {
    const isOnline = useIsOnline();

    return isOnline ? children : null;
}
