import { PaletteIcon, ShieldIcon, UserIcon } from 'lucide-react'

export const SETTINGS_NAV_ITEMS = [
  {
    title: 'Profile',
    href: '/dashboard/settings/profile',
    icon: UserIcon,
    description: 'Personal information and profile picture',
  },
  {
    title: 'Security',
    href: '/dashboard/settings/security',
    icon: ShieldIcon,
    description: 'Password and email settings',
  },
  {
    title: 'Appearance',
    href: '/dashboard/settings/appearance',
    icon: PaletteIcon,
    description: 'Theme and display preferences',
  },
]
