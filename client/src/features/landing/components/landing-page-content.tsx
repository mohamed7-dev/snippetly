'use client'

import { FeaturesSection } from './features-section'
import { DemoSection } from './demo-section'
import { TestimonialsSection } from './testimonials-section'
import { CtaSection } from './cta-section'
import { HeroSection } from './hero-section'
import { FooterSection } from './footer-section'
import React from 'react'

export function LandingPageContent() {
  return (
    <React.Fragment>
      {/* Hero Section */}
      <HeroSection />

      {/* Features Section */}
      <FeaturesSection />

      {/* Demo Section */}
      <DemoSection />

      {/* Testimonials */}
      <TestimonialsSection />

      {/* CTA Section */}
      <CtaSection />

      {/* Footer */}
      <FooterSection />
    </React.Fragment>
  )
}
