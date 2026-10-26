import { BottomNavigation } from '../shared/bottom-navigation';
import { DesktopSidebar } from './desktop-sidebar';
import { DashBoardHeader } from './header';

type DashboardLayoutProps = {
    children: React.ReactNode;
};
export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div className="min-h-screen pb-[calc(4rem+env(safe-area-inset-bottom))] lg:pb-0">
            <DashBoardHeader />
            <div className="flex-1 flex">
                <DesktopSidebar />
                <main className="flex-1 py-6 px-3 md:px-6">{children}</main>
            </div>
            <BottomNavigation />
        </div>
    );
}
