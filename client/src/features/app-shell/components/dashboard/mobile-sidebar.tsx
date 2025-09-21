import { Button } from '@/components/ui/button'
import { Sheet, SheetContent, SheetTrigger } from '@/components/ui/sheet'
import { MenuIcon } from 'lucide-react'
import { SidebarContent } from './sidebar-content'
import { MobileSidebarFooter } from '../shared/mobile-sidebar-footer'

export function MobileSidebar() {
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button size={'icon'} variant={'ghost'} className="flex lg:hidden">
          <MenuIcon className="size-6" />
          <span className="sr-only">open sidebar</span>
        </Button>
      </SheetTrigger>
      <SheetContent
        side="left"
        className="px-2 py-4 flex flex-col justify-between"
      >
        <SidebarContent />
        <MobileSidebarFooter />
      </SheetContent>
    </Sheet>
  )
}
