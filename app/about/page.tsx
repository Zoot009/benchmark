import type { Metadata } from 'next'
import Link from 'next/link'
import { PageHead } from '@/components/ui'
import { getCities, getTotals } from '@/lib/data'
import { SITE } from '@/lib/site'
import { num } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'How we survey',
  description: `How ${SITE.name} collects, ranks and corrects its listings of local businesses.`,
  alternates: { canonical: '/about' },
}

export default async function AboutPage() {
  const [t, cities] = await Promise.all([getTotals(), getCities()])
  return (
    <>
      <PageHead
        crumbs={[{ name: 'Home', href: '/' }, { name: 'About' }]}
        kicker="About"
        title="How we survey"
        lede={<>{SITE.name} maps {num(t.businesses)} local businesses in {cities.length} cities: who they are, where they stand and how to reach them, in one consistent format.</>}
      />
      <section className="sec">
        <div className="wrap about">
          <section>
            <h2>What a listing holds</h2>
            <p>
              Name, address and phone number: the three details customers, maps and search engines check against each other. Each listing
              also carries its website, opening hours, category, neighbourhood and exact position where they’re known.
            </p>
          </section>
          <section>
            <h2>Where it comes from</h2>
            <p>
              Listings are compiled from public map listings and refreshed periodically. Ratings and review counts are those published on
              Google. We don’t sell placement and we don’t accept payment for rank.
            </p>
          </section>
          <section>
            <h2>How lists are ranked</h2>
            <p>
              Each rating is weighed against how many people gave it, so a handful of perfect scores can’t outrank hundreds of very good ones.
              Lists with fewer than five businesses aren’t published.
            </p>
          </section>
          <section>
            <h2>Additions and corrections</h2>
            <p>
              Owners can <Link href="/add-a-business">add a missing business</Link>; a person reads every request before it’s published. To
              correct a listing, write to <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with its survey mark, shown on every business page
              (like BM-04A7-91C2).
            </p>
          </section>
        </div>
      </section>
    </>
  )
}
