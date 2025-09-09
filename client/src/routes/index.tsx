import { LandingPageView } from '@/components/views/landing-page-view'
import { LandingHeader } from '@/features/app-shell'
import { createFileRoute } from '@tanstack/react-router'
import React from 'react'

export const Route = createFileRoute('/')({
  component: LandingPage,
})

function LandingPage() {
  return (
    <React.Fragment>
      <LandingHeader />
      <LandingPageView />
    </React.Fragment>
  )
}
