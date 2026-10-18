import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { formatDeveloperInfo } from '@/lib/format-developer-info';
import { Link } from '@tanstack/react-router';
import { cva, type VariantProps } from 'class-variance-authority';
import { BadgeCheckIcon } from 'lucide-react';

const identityVariants = cva(
    'inline-flex min-w-0 items-center gap-2 hover:text-primary [&_[data-slot=developer-name]]:font-medium',
    {
        variants: {
            size: {
                xs: '[&_[data-slot=avatar]]:size-4 [&_[data-slot=developer-name]]:text-xs [&_[data-slot=verified-icon]]:size-3',
                sm: '[&_[data-slot=avatar]]:size-6 [&_[data-slot=developer-name]]:text-xs [&_[data-slot=verified-icon]]:size-3',
                default:
                    '[&_[data-slot=avatar]]:size-10 [&_[data-slot=developer-name]]:text-base [&_[data-slot=verified-icon]]:size-4',
                lg: '[&_[data-slot=avatar]]:size-16 [&_[data-slot=developer-name]]:text-2xl [&_[data-slot=verified-icon]]:size-5',
            },
        },
        defaultVariants: {
            size: 'default',
        },
    },
);

type DeveloperIdentityInfo = {
    id: string;
    firstName: string;
    lastName: string;
    image: string | null;
    isVerified: boolean;
};

interface DeveloperIdentityProps extends VariantProps<typeof identityVariants> {
    developerInfo: DeveloperIdentityInfo;
    /**
     * @description
     * Controls the element in which the name is rendered
     * @default 'span'
     */
    as?: string;
}

export function DeveloperIdentity({ developerInfo, size, as }: DeveloperIdentityProps) {
    const { fullName, initials } = formatDeveloperInfo(developerInfo);
    const NameComp = (as ?? 'span') as any;

    return (
        <Link
            to="/profile/$id"
            params={{ id: developerInfo.id }}
            preload={false}
            className={identityVariants({ size })}
        >
            <Avatar>
                <AvatarImage src={developerInfo.image || '/placeholder.svg'} alt="" />
                <AvatarFallback>{initials}</AvatarFallback>
            </Avatar>
            <NameComp data-slot="developer-name" className="max-w-48 truncate">
                {fullName}
            </NameComp>
            {developerInfo.isVerified && (
                <BadgeCheckIcon
                    data-slot="verified-icon"
                    className="shrink-0 text-primary"
                    aria-label="Verified developer"
                />
            )}
        </Link>
    );
}
