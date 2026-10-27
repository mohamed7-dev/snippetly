import { useIsMobile } from '@/hooks/use-is-mobile';
import { EllipsisVerticalIcon } from 'lucide-react';
import React from 'react';
import { Button } from '../ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '../ui/dropdown-menu';
import { isOfType } from './page';

interface PageActionBarProps {
    children: React.ReactNode;
}
export function PageActionBar({ children }: PageActionBarProps) {
    const isMobile = useIsMobile();
    const childArray = React.Children.toArray(children);
    const actionItems = childArray.filter(child => isPageActionBarItem(child));
    const menuItems = childArray.filter(child => isPageActionBarMenuItem(child));
    const directChildren = childArray.filter(
        child => !isPageActionBarItem(child) && !isPageActionBarMenuItem(child),
    );
    let actionsItemsToRender = actionItems;

    if (isMobile) {
        actionsItemsToRender = actionItems.filter(child => !isHiddenOnSmallScreens(child));
        if (actionsItemsToRender.length > 1) {
            // on mobile screens, render only the last action item
            actionsItemsToRender = [actionsItemsToRender[actionsItemsToRender.length - 1]];
        }
    }

    return (
        <div className="flex justify-end gap-4">
            {/* Hide direct children on mobile */}
            <div className="hidden lg:block">
                {!isMobile &&
                    directChildren.map((child, index) => (
                        <React.Fragment key={index}>{child}</React.Fragment>
                    ))}
            </div>

            {/* Render action items */}
            {actionsItemsToRender.map((item, index) =>
                React.cloneElement(item as React.ReactElement<ActionBarItemProps>, {
                    key: `action-${index}`,
                }),
            )}

            {/* Dropdown menu */}
            <div className="block lg:hidden">
                {menuItems.length > 0 && isMobile && <PageActionBarDropdownMenu items={menuItems} />}
            </div>
        </div>
    );
}

export interface ActionBarItemProps {
    children: React.ReactNode;
    hideOnSmallScreens?: boolean;
}

export function PageActionBarItem({ children }: ActionBarItemProps) {
    return <>{children}</>;
}

export interface PageActionBarMenuItemProps {
    children: React.ReactNode;
}

export function PageActionBarMenuItem({ children }: PageActionBarMenuItemProps) {
    return <>{children}</>;
}

interface PageActionBarDropdownMenuProps {
    items: React.ReactNode[];
}

function PageActionBarDropdownMenu({ items }: PageActionBarDropdownMenuProps) {
    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                    <EllipsisVerticalIcon />
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
                {items.map((item, index) => (
                    <React.Fragment key={`menu-item-${index}`}>{item}</React.Fragment>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}

// UTILS //

function isPageActionBarItem(child: unknown): boolean {
    return isOfType(child, PageActionBarItem);
}

function isPageActionBarMenuItem(child: unknown): boolean {
    return isOfType(child, PageActionBarMenuItem);
}

function isHiddenOnSmallScreens(child: React.ReactNode): boolean {
    return React.isValidElement<ActionBarItemProps>(child) && child.props.hideOnSmallScreens === true;
}
