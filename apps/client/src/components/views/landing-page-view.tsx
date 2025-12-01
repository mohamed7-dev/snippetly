import { LandingHeader } from '@/features/app-shell/components/landing/header'
import { LandingPageContent } from '@/features/landing'
import React from 'react'

export function LandingPageView() {
  return (
    <React.Fragment>
      <LandingHeader />
      <main>
        <LandingPageContent />
      </main>
    </React.Fragment>
  )
}
