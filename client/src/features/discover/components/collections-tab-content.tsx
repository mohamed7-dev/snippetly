import { UsersIcon } from 'lucide-react'

export function CollectionsTabContent() {
  return (
    <div className="text-center py-12">
      <UsersIcon className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
      <h3 className="text-lg font-semibold mb-2">Discover Collections</h3>
      <p className="text-muted-foreground">
        Explore curated collections from the community
      </p>
    </div>
  )
}
