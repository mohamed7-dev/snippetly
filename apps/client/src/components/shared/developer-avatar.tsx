import { formatDeveloperInfo } from '@/lib/format-developer-info';
import { Avatar } from '@radix-ui/react-avatar';
import { Link } from '@tanstack/react-router';
import { AvatarFallback, AvatarImage } from '../ui/avatar';

export function DeveloperAvatar({
    developerInfo,
}: {
    developerInfo: { firstName: string; lastName: string; id: string; image: string };
}) {
    const { fullName, initials } = formatDeveloperInfo(developerInfo);
    return (
        <Link
            to="/developers/$id"
            params={{ id: developerInfo.id }}
            preload={false}
            className="inline-flex min-w-0 items-center gap-1 hover:text-primary"
        >
            <Avatar className="size-4">
                <AvatarImage src={developerInfo.image || '/placeholder.svg'} alt="" />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <span className="max-w-24 truncate">{fullName}</span>
        </Link>
    );
}
