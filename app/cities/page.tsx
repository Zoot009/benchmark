import type { Metadata } from 'next'
import Link from 'next/link'
import { CityFilter } from '@/components/client'
import { PageHead } from '@/components/ui'
import { getCities } from '@/lib/data'
import { fold, num } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'All cities',
  description: 'Every city in the survey, country by country, with how many local businesses each has.',
  alternates: { canonical: '/cities' },
}

// Countries A to Z; within each, the busiest city first. Sheet numbers follow the overall order, busiest first.
export default async function CitiesPage() {
  const cities = await getCities()
  const sheetNo = new Map(cities.map((c, i) => [c.slug, String(i + 1).padStart(3, '0')]))
  const countries = [...Map.groupBy(cities, c => c.country)].sort(([a], [b]) => a.localeCompare(b))

  return (
    <>
      <PageHead
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Cities' }]}
        kicker={<>Sheet index · {cities.length} cities in {countries.length} countries</>}
        title="Cities we’ve mapped"
        lede={<>{num(cities.reduce((s, c) => s + c.count, 0))} businesses surveyed. Pick a city to see its categories, neighbourhoods and highest-rated businesses.</>}
      >
        <CityFilter total={cities.length} />
      </PageHead>
      <section className="sec">
        <div className="wrap">
          {countries.map(([country, list]) => (
            <section key={country} className="country" data-country>
              <h2>{country}<small className="mono">{list.length} {list.length === 1 ? 'city' : 'cities'} · {num(list.reduce((s, c) => s + c.count, 0))} businesses</small></h2>
              <ul className="city-grid">
                {list.map(c => (
                  <li key={c.slug} data-name={fold(`${c.name} ${c.label} ${country}`)}>
                    <Link href={`/${c.slug}`}>
                      <span className="mono">Sheet {sheetNo.get(c.slug)}</span>
                      <b>{c.name}</b>
                      <small>{num(c.count)} businesses · {c.categories} lists</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
          <p className="none-found" hidden>No city by that name yet.</p>
        </div>
      </section>
    </>
  )
}
