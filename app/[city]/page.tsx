import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Crumbs, DotMap, Entry, MapSymbol, SearchPanel, SecHead, Sheet } from '@/components/ui'
import { getCities, getCity, getCityAreas, getCityCategories, getPoints, getTopRated } from '@/lib/data'
import { cap, coords, num, plural, project } from '@/lib/utils'

// The busiest cities are built ahead of time; the rest render on their first visit and are then cached.
export async function generateStaticParams() {
  return (await getCities()).slice(0, 40).map(c => ({ city: c.slug }))
}

export async function generateMetadata({ params }: PageProps<'/[city]'>): Promise<Metadata> {
  const c = await getCity((await params).city)
  if (!c) return {}
  return {
    title: `Local businesses in ${c.name}`,
    description: `${num(c.count)} local businesses in ${c.label}, across ${c.categories} categories: addresses, phone numbers, hours and ratings.`,
    alternates: { canonical: `/${c.slug}` },
  }
}

export default async function CityPage({ params }: PageProps<'/[city]'>) {
  const c = await getCity((await params).city)
  if (!c) notFound()
  const [trades, areas, top, pts] = await Promise.all([getCityCategories(c.slug), getCityAreas(c.slug), getTopRated(6, c.slug), getPoints([c.slug], 1400)])
  const centre = pts.length ? coords(pts.reduce((s, p) => s + p.lat, 0) / pts.length, pts.reduce((s, p) => s + p.lng, 0) / pts.length) : ''
  const byGroup = Map.groupBy(trades, t => t.group)

  return (
    <>
      <section className="hero hero-city contours">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <Crumbs items={[{ name: 'Home', href: '/' }, { name: 'Cities', href: '/cities' }, { name: c.name }]} />
            <p className="kicker">Sheet · {c.country}</p>
            <h1>{c.name}</h1>
            <p className="lede">{num(c.count)} businesses surveyed across {trades.length} categories{centre && <>, centred on <span className="mono">{centre}</span></>}.</p>
            <SearchPanel loc={c.name} />
          </div>
          {pts.length > 1 && (
            <Sheet className="sheet-hero" caption={<><span><b>{c.name}</b>{c.label}</span><span className="mono">{num(pts.length)} plotted</span></>}>
              <DotMap points={project(pts, 560, 440, 22)} w={560} h={440} cols={7} rows={5} title={`Where ${c.name}’s businesses are`} />
            </Sheet>
          )}
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SecHead kicker="Legend" title={`Categories in ${c.name}`} sub="Each list is ranked by rating and review count. The leader is named beside it." />
          <div className="legend legend-wide">
            {[...byGroup].map(([group, list]) => (
              <section key={group} className="legend-group">
                <h3><MapSymbol group={group} size={18} />{group}</h3>
                <ul>
                  {list.map(t => (
                    <li key={t.slug}>
                      <Link href={`/${c.slug}/${t.slug}`}>
                        <span>{cap(plural(t.name))}{t.top && <small>Top: {t.top}</small>}</span><i /><span className="mono">{t.count}</span>
                      </Link>
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </div>
      </section>

      {areas.length > 0 && (
        <section className="sec sec-tint">
          <div className="wrap">
            <SecHead kicker="Localities" title="Neighbourhoods" sub={`Search by neighbourhood within ${c.name}.`} />
            <ul className="chips">
              {areas.map(a => (
                <li key={a.slug}><Link href={`/search?loc=${encodeURIComponent(`${a.name}, ${c.name}`)}`}>{a.name}<span>{a.count}</span></Link></li>
              ))}
            </ul>
          </div>
        </section>
      )}

      {top.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead kicker="Benchmarks" title={`Highest-rated in ${c.name}`} href={`/search?loc=${encodeURIComponent(c.name)}&sort=rating`} linkText="More" />
            <div className="entries">{top.map((b, i) => <Entry key={b.key} b={b} n={i + 1} />)}</div>
          </div>
        </section>
      )}
    </>
  )
}
