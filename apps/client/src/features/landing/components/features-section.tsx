import { Card, CardContent } from '@/components/ui/card'
import { APP_NAME } from '@/config/app'
import { BookOpenIcon, Code2Icon, UsersIcon } from 'lucide-react'

export function FeaturesSection() {
  return (
    <section id="features" className="py-20 bg-muted/30">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4">
            Everything you need to manage code snippets
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            From personal organization to team collaboration, {APP_NAME} has all
            the features you need.
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <Code2Icon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">
                Smart Organization
              </h3>
              <p className="text-muted-foreground">
                Organize snippets with tags, collections, and powerful search.
                Find any code in seconds.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <UsersIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">
                Social Sharing
              </h3>
              <p className="text-muted-foreground">
                Connect with friends and teammates. Share snippets and discover
                new solutions together.
              </p>
            </CardContent>
          </Card>

          <Card className="border-border hover:shadow-lg transition-shadow">
            <CardContent className="p-6">
              <div className="h-12 w-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                <BookOpenIcon className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-heading font-semibold text-xl mb-2">
                Collections
              </h3>
              <p className="text-muted-foreground">
                Group related snippets into collections. Perfect for projects,
                tutorials, or learning paths.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
