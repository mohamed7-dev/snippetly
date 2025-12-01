import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon, LibraryIcon, StarIcon } from 'lucide-react'
import { useLoaderData } from '@tanstack/react-router'

export function HeroSection() {
  const data = useLoaderData({ from: '/(public)/' })
  return (
    <section className="py-20 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-4xl mx-auto">
          <Badge variant="secondary" className="mb-6">
            <StarIcon className="h-4 w-4 mr-1" />
            Trusted by 10,000+ developers
          </Badge>
          <h1 className="font-heading font-bold text-4xl sm:text-5xl lg:text-6xl text-balance mb-6">
            Your Personal
            <span className="text-primary"> Code Library</span>
          </h1>
          <p className="text-xl text-muted-foreground text-pretty mb-8 max-w-2xl mx-auto">
            Save, organize, and share your code snippets with friends. Build a
            searchable library of your best code and discover snippets from your
            network.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" className="text-lg px-8" asChild>
              <Link to="/signup">
                Start Building Your Library
                <ArrowRightIcon className="ml-2 h-5 w-5" />
              </Link>
            </Button>
            {!!data.length && (
              <Button size="lg" className="text-lg px-8" asChild>
                <Link to="/offline">
                  Access Your Offline Library
                  <LibraryIcon className="ml-2 h-5 w-5" />
                </Link>
              </Button>
            )}
            {!!!data.length && (
              <Button
                size="lg"
                variant="outline"
                className="text-lg px-8 bg-transparent"
                asChild
              >
                <Link to="." hash="demo">
                  View Demo
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </section>
  )
}
