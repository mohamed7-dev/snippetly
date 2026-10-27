import { Card, CardContent } from '@/components/ui/card';
import type { LucideIcon } from 'lucide-react';
import type { ReactNode } from 'react';

type StatCardVariant = 'primary' | 'secondary' | 'accent';

interface StatCardProps {
    icon: LucideIcon;
    value: ReactNode;
    label: string;
    variant?: StatCardVariant;
}

const iconStyles: Record<StatCardVariant, string> = {
    primary: 'bg-primary text-primary-foreground',
    secondary: 'bg-secondary text-secondary-foreground',
    accent: 'bg-accent text-accent-foreground',
};

export function StatCard({ icon: Icon, value, label, variant = 'primary' }: StatCardProps) {
    return (
        <Card>
            <CardContent>
                <div className="space-y-2 text-center">
                    <div className={`mx-auto w-fit rounded-lg p-2 ${iconStyles[variant]}`}>
                        <Icon className="size-8" aria-hidden="true" />
                    </div>
                    <div className="text-2xl font-bold">{value}</div>
                    <p className="text-sm text-muted-foreground">{label}</p>
                </div>
            </CardContent>
        </Card>
    );
}
