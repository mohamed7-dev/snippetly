import { Permission } from '@snippetly/common/dto';
import {
    BellIcon,
    BookOpenIcon,
    CodeIcon,
    LayoutDashboardIcon,
    PaletteIcon,
    SearchIcon,
    ShieldIcon,
    UserIcon,
    UsersIcon,
} from 'lucide-react';

export const SETTINGS_NAV_ITEMS = [
    {
        id: 'profile',
        title: 'Profile',
        href: '/dashboard/settings/profile',
        icon: UserIcon,
        description: 'Personal information and profile picture',
        requiredPermissions: [Permission.Authenticated],
    },
    {
        id: 'security',
        title: 'Security',
        href: '/dashboard/settings/security',
        icon: ShieldIcon,
        description: 'Password and email settings',
        requiredPermissions: [Permission.Authenticated],
    },
    {
        id: 'appearance',
        title: 'Appearance',
        href: '/dashboard/settings/appearance',
        icon: PaletteIcon,
        description: 'Theme and display preferences',
        requiredPermissions: [Permission.Authenticated],
    },
];

export const DASHBOARD_NAV_ITEMS = [
    {
        id: 'insights',
        title: 'Insights',
        href: '/dashboard',
        icon: LayoutDashboardIcon,
        requiredPermissions: [Permission.Authenticated],
        exact: true,
    },
    {
        id: 'collections',
        title: 'Collections',
        href: '/dashboard/collections',
        icon: BookOpenIcon,
        requiredPermissions: [Permission.Authenticated],
        exact: false,
    },
    {
        id: 'snippets',
        title: 'Snippets',
        href: '/dashboard/snippets',
        icon: CodeIcon,
        requiredPermissions: [Permission.Authenticated],
        exact: false,
    },
    {
        id: 'friends',
        title: 'Friends',
        href: '/dashboard/friends',
        icon: UsersIcon,
        requiredPermissions: [Permission.Authenticated],
        exact: false,
    },
    {
        id: 'discover',
        title: 'Discover',
        href: '/dashboard/discover',
        icon: SearchIcon,
        requiredPermissions: [Permission.Authenticated],
        exact: false,
    },
    {
        id: 'requests',
        title: 'Requests',
        href: '/dashboard/requests',
        icon: BellIcon,
        requiredPermissions: [Permission.Authenticated],
        exact: false,
    },
];
