import { Card, CardContent } from '@/components/ui/card'

export function DemoSection() {
  return (
    <section id="demo" className="py-20">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="font-heading font-bold text-3xl lg:text-4xl mb-4">
            See CodeVault in action
          </h2>
          <p className="text-xl text-muted-foreground">
            A clean, intuitive interface designed for developers
          </p>
        </div>

        <div className="max-w-4xl mx-auto">
          <Card className="border-border overflow-hidden">
            <CardContent className="p-0">
              <div className="bg-card p-6">
                <div className="flex items-center gap-2 mb-4">
                  <div className="h-3 w-3 rounded-full bg-destructive"></div>
                  <div className="h-3 w-3 rounded-full bg-secondary"></div>
                  <div className="h-3 w-3 rounded-full bg-primary"></div>
                </div>
                <div className="bg-muted rounded-lg p-4 font-mono text-sm">
                  <div className="text-muted-foreground mb-2">
                    // React Hook for API calls
                  </div>
                  <div className="text-primary">const</div>{' '}
                  <span className="text-foreground">
                    useApi = (url) =&gt; {`{`}
                  </span>
                  <div className="ml-4 text-foreground">
                    <div className="text-primary">const</div> [data, setData] =
                    useState(null);
                  </div>
                  <div className="ml-4 text-foreground">
                    <div className="text-primary">const</div> [loading,
                    setLoading] = useState(true);
                  </div>
                  <div className="text-foreground">{`}`}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </section>
  )
}
