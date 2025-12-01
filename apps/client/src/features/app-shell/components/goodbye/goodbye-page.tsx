import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { APP_NAME } from '@/config/app'
import { Link } from '@tanstack/react-router'
import { HeartIcon, HomeIcon, SparklesIcon } from 'lucide-react'
import React from 'react'

export function GoodbyePage() {
  const [mounted, setMounted] = React.useState(false)

  React.useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return null
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-background via-background to-muted/20 flex items-center justify-center p-4">
      <div className="w-full max-w-2xl mx-auto text-center space-y-8">
        {/* Animated farewell icon */}
        <div className="relative">
          <div className="absolute inset-0 animate-ping">
            <div className="w-24 h-24 mx-auto rounded-full bg-primary/20"></div>
          </div>
          <div className="relative w-24 h-24 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
            <HeartIcon className="w-12 h-12 text-primary animate-pulse" />
          </div>
        </div>

        {/* Main farewell message */}
        <div className="space-y-4">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-primary via-accent to-primary bg-clip-text text-transparent animate-in slide-in-from-bottom-4 duration-1000">
            Farewell, Developer
          </h1>
          <p className="text-xl text-muted-foreground animate-in slide-in-from-bottom-4 duration-1000 delay-200">
            Your account has been successfully deleted
          </p>
        </div>

        {/* Farewell card */}
        <Card className="animate-in slide-in-from-bottom-4 duration-1000 delay-400 border-primary/20 bg-gradient-to-br from-card to-muted/5">
          <CardContent className="p-8 space-y-6">
            <div className="flex items-center justify-center gap-2 text-primary">
              <SparklesIcon className="w-5 h-5" />
              <span className="font-medium">
                Thank you for being part of {APP_NAME}
              </span>
              <SparklesIcon className="w-5 h-5" />
            </div>

            <div className="space-y-4 text-muted-foreground">
              <p className="text-lg">
                We're sorry to see you go! Your journey with us has come to an
                end, but we hope the code snippets and memories you've created
                will continue to inspire your development work.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 py-4">
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">🚀</span>
                  </div>
                  <p className="text-sm">Keep coding amazing things</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-accent/10 flex items-center justify-center">
                    <span className="text-2xl">💡</span>
                  </div>
                  <p className="text-sm">Never stop learning</p>
                </div>
                <div className="text-center space-y-2">
                  <div className="w-12 h-12 mx-auto rounded-full bg-primary/10 flex items-center justify-center">
                    <span className="text-2xl">🌟</span>
                  </div>
                  <p className="text-sm">Build something incredible</p>
                </div>
              </div>

              <p className="text-base">
                If you ever decide to return, we'll be here with open arms and
                fresh features waiting for you.
              </p>
            </div>

            <div className="pt-4">
              <Link to="/">
                <Button size="lg" className="w-full sm:w-auto group">
                  <HomeIcon className="w-4 h-4 mr-2 group-hover:scale-110 transition-transform" />
                  Return to Homepage
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>

        {/* Footer message */}
        <p className="text-sm text-muted-foreground animate-in fade-in duration-1000 delay-1000">
          Wishing you all the best in your coding adventures ahead! 👋
        </p>
      </div>
    </main>
  )
}
