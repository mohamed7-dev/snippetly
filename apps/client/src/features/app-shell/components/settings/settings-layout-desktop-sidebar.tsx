import { SidebarContent } from './sidebar-content';

export function SettingsLayoutDesktopSidebar() {
    return (
        <div className="hidden md:block w-64 shrink-0">
            <SidebarContent />
        </div>
    );
}
