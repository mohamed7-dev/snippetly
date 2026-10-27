import { DesktopSidebar } from './desktop-sidebar';
import { DashBoardHeader } from './header';

type DashboardLayoutProps = {
    children: React.ReactNode;
};
export function DashboardLayout({ children }: DashboardLayoutProps) {
    return (
        <div>
            <DashBoardHeader />
            <div className="flex-1 flex">
                <DesktopSidebar />
                <main className="container mx-auto w-full max-w-screen-2xl flex-1 py-6 px-3 md:px-6">
                    {children}
                </main>
            </div>
        </div>
    );
}
