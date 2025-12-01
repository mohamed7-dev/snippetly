import type { Theme } from '@/components/providers/theme-provider'
import { MonitorIcon, MoonIcon, SunIcon } from 'lucide-react'

export const THEME_OPTIONS = [
  {
    value: 'light' as Theme,
    label: 'Light',
    description: 'Clean and bright interface',
    icon: SunIcon,
    preview: 'bg-white border-gray-200',
  },
  {
    value: 'dark' as Theme,
    label: 'Dark',
    description: 'Easy on the eyes in low light',
    icon: MoonIcon,
    preview: 'bg-gray-900 border-gray-700',
  },
  {
    value: 'system' as Theme,
    label: 'System',
    description: 'Adapts to your device settings',
    icon: MonitorIcon,
    preview: 'bg-gradient-to-br from-white to-gray-900 border-gray-400',
  },
]
