import { SidebarContent } from './sidebar-content';

export function SettingsLayoutDesktopSidebar() {
    return (
        <div className="lg:ms-72">
            <aside className="fixed inset-s-0 top-[73px] hidden lg:block px-4 py-2 w-72 min-h-[calc(100vh-73px)]">
                <SidebarContent />
            </aside>
        </div>
    );
}
