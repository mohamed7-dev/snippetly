import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { ArrowRightIcon } from 'lucide-react'

export function CtaSection() {
  return (
    <section className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-3xl mx-auto">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4">
            Ready to organize your code?
          </h2>
          <p className="text-xl text-muted-foreground mb-8">
            Join thousands of developers who have already built their personal
            code libraries.
          </p>
          <Button size="lg" className="text-lg px-8" asChild>
            <Link to="/signup">
              Get Started for Free
              <ArrowRightIcon className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
