import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PermissionGuard } from '@/features/auth/components/shared/permission-guard';
import { Permission } from '@snippetly/common/dto';
import { Link } from '@tanstack/react-router';
import { PlusIcon, SearchIcon } from 'lucide-react';
import React from 'react';

export function SnippetsPageContentHeader() {
    return (
        <React.Fragment>
            <div className="mb-8">
                <h1 className="font-heading font-bold text-3xl mb-2">My Snippets</h1>
                <p className="text-muted-foreground text-lg">Keep your code snippets in one place</p>
            </div>

            <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
                <div className="relative w-full md:w-64">
                    <SearchIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input placeholder="Search snippets..." className="pl-10 bg-muted/50 border-border" />
                </div>
                <div className="flex items-center gap-3">
                    <PermissionGuard
                        requiredPermissions={[Permission.Authenticated, Permission.CreateSnippet]}
                    >
                        <Button asChild>
                            <Link to={'/dashboard/snippets/new'}>
                                <PlusIcon className="h-4 w-4 mr-2" />
                                <span>New Snippet</span>
                            </Link>
                        </Button>
                    </PermissionGuard>
                </div>
            </div>
        </React.Fragment>
    );
}
