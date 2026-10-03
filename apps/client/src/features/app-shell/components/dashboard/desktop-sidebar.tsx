import { SidebarContent } from './sidebar-content';

export function DesktopSidebar() {
    return (
        <div className="lg:ms-64">
            <aside className="fixed start-0 top-[73px] hidden lg:block w-64 border-e border-border bg-muted/30 min-h-[calc(100vh-73px)]">
                <SidebarContent />
            </aside>
        </div>
    );
}
