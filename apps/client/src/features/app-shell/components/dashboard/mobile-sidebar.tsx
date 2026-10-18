import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet';
import { MenuIcon } from 'lucide-react';
import { SidebarContent } from './sidebar-content';
import { DashboardSidebarFooter } from './sidebar-footer';

export function MobileSidebar() {
    return (
        <Sheet>
            <SheetTrigger asChild>
                <Button size={'icon'} variant={'ghost'} className="flex lg:hidden">
                    <MenuIcon className="size-6" />
                    <span className="sr-only">open sidebar</span>
                </Button>
            </SheetTrigger>
            <SheetContent side="left" className="flex flex-col justify-between px-2 py-4">
                <div className="min-h-0 flex-1 overflow-y-auto">
                    <SidebarContent />
                </div>
                <DashboardSidebarFooter />
            </SheetContent>
        </Sheet>
    );
}
