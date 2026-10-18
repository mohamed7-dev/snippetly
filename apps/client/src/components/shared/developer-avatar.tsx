import { formatDeveloperInfo } from '@/lib/format-developer-info';
import { Avatar } from '@radix-ui/react-avatar';
import { Link } from '@tanstack/react-router';
import { cva, type VariantProps } from 'class-variance-authority';
import { AvatarFallback, AvatarImage } from '../ui/avatar';

const avatarVariants = cva('', {
    variants: {
        size: {
            default: 'size-16',
            sm: 'size-8',
            lg: 'size-32',
        },
    },
    defaultVariants: {
        size: 'default',
    },
});

export function DeveloperAvatar({
    developerInfo,
}: {
    developerInfo: { firstName: string; lastName: string; id: string; image: string };
} & VariantProps<typeof avatarVariants>) {
    const { fullName, initials } = formatDeveloperInfo(developerInfo);
    return (
        <Link
            to="/profile/$id"
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
