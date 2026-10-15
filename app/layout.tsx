import type { Metadata } from 'next'
import { Martian_Mono, Schibsted_Grotesk } from 'next/font/google'
import { Footer, Header } from '@/components/ui'
import { SITE } from '@/lib/site'
import './globals.css'

// A sturdy news grotesk for everything, and a survey-instrument mono for coordinates, counts and labels.
const sans = Schibsted_Grotesk({ variable: '--f-sans', subsets: ['latin', 'latin-ext'] })
const mono = Martian_Mono({ variable: '--f-mono', subsets: ['latin', 'latin-ext'], axes: ['wdth'] })

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: { default: `${SITE.name}: ${SITE.tagline}`, template: `%s | ${SITE.name}` },
  description: 'Addresses, phone numbers, opening hours and ratings for local businesses, ranked fairly and mapped street by street.',
  openGraph: { siteName: SITE.name, type: 'website' },
}

export default function RootLayout({ children }: LayoutProps<'/'>) {
  return (
    <html lang="en" className={`${sans.variable} ${mono.variable}`}>
      <body>
        <a href="#main" className="skip">Skip to content</a>
        <Header />
        <main id="main">{children}</main>
        <Footer />
      </body>
    </html>
  )
}
