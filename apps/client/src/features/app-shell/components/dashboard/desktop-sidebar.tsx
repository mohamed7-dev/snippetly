import { SidebarContent } from './sidebar-content';
import { DashboardSidebarFooter } from './sidebar-footer';

export function DesktopSidebar() {
    return (
        <div className="lg:ms-64">
            <aside className="fixed inset-s-0 top-[73px] hidden h-[calc(100dvh-73px)] w-64 flex-col border-e border-border bg-muted/30 lg:flex">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <SidebarContent />
                </div>
                <DashboardSidebarFooter />
            </aside>
        </div>
    );
}
