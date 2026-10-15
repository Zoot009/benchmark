import type { Metadata } from 'next'
import Link from 'next/link'
import { MapSymbol, PageHead } from '@/components/ui'
import { getCategoryGroups } from '@/lib/data'
import { cap, num, plural } from '@/lib/utils'

export const metadata: Metadata = {
  title: 'All categories',
  description: 'Every category in the survey, group by group, with how many local businesses and city lists each has.',
  alternates: { canonical: '/categories' },
}

const pad = (i: number) => String(i + 1).padStart(2, '0')

// An atlas: a sheet index to jump from, then one plate per group with its categories as tiles, counts as spot heights.
export default async function CategoriesPage() {
  const groups = (await getCategoryGroups()).map(g => ({ ...g, total: g.niches.reduce((s, n) => s + n.count, 0) }))
  const total = groups.reduce((s, g) => s + g.niches.length, 0)
  return (
    <>
      <PageHead
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Categories' }]}
        kicker={<>Atlas · {total} categories on {groups.length} plates</>}
        title="All categories"
        lede="Choose a category to see every city where it has a ranked list."
      >
        <nav className="index-mini" aria-label="Plates">
          {groups.map((g, i) => (
            <a key={g.slug} href={`#${g.slug}`}>
              <span className="mono">{pad(i)}</span>
              <MapSymbol group={g.name} size={13} />
              <b>{g.name}</b>
              <span className="mono">{num(g.total)}</span>
            </a>
          ))}
        </nav>
      </PageHead>
      <section className="sec">
        <div className="wrap plates">
          {groups.map((g, i) => (
            <section key={g.slug} id={g.slug} className="plate">
              <header className="plate-head contours">
                <span className="mono">Plate {pad(i)}</span>
                <span className="plate-symbol"><MapSymbol group={g.name} size={26} /></span>
                <h2>{g.name}</h2>
                <p className="mono">{g.niches.length} {g.niches.length === 1 ? 'category' : 'categories'} · {num(g.total)} businesses</p>
              </header>
              <ul className="plate-tiles">
                {[...g.niches].sort((a, b) => b.count - a.count).map(n => (
                  <li key={n.slug}>
                    <Link href={`/categories/${n.slug}`}>
                      <b>{cap(plural(n.name))}</b>
                      <span className="spot mono" title={`${num(n.count)} businesses`}>{num(n.count)}</span>
                      <small>Ranked lists in {n.lists} {n.lists === 1 ? 'city' : 'cities'}</small>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      </section>
    </>
  )
}
