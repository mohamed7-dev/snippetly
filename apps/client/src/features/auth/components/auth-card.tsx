import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import { ArrowLeftIcon, Code2Icon } from 'lucide-react'
import React from 'react'
import { Button } from '@/components/ui/button'
import { Link } from '@tanstack/react-router'
import { APP_NAME } from '@/config/app'

type AuthCardProps = {
  children: React.ReactNode
  cardDescription: string
  cardTitle: string
}
export function AuthCard({
  cardDescription,
  cardTitle,
  children,
}: AuthCardProps) {
  return (
    <div className="w-full max-w-md">
      <div className="mb-8">
        <Button variant="ghost" size="sm" asChild>
          <Link to="/" className="flex items-center gap-2">
            <ArrowLeftIcon className="h-4 w-4" />
            Back to home
          </Link>
        </Button>
      </div>

      <Card className="border-border">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Code2Icon className="h-8 w-8 text-primary" />
            <span className="font-heading font-bold text-xl">{APP_NAME}</span>
          </div>
          <CardTitle className="font-heading text-2xl">{cardTitle}</CardTitle>
          <CardDescription>{cardDescription}</CardDescription>
        </CardHeader>
        <CardContent>{children}</CardContent>
      </Card>
    </div>
  )
}
