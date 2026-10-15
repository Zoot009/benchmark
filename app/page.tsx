import Link from 'next/link'
import { DotMap, Icon, JsonLd, MapSymbol, SearchPanel, SecHead, Sheet, Trig } from '@/components/ui'
import { getCategoryGroups, getCities, getPoints, getSampleLists, getTopRated, getTotals } from '@/lib/data'
import { SITE } from '@/lib/site'
import { cap, cityName, coords, num, plural, project } from '@/lib/utils'

const compact = new Intl.NumberFormat('en', { notation: 'compact', maximumFractionDigits: 1 })
const SHEETS = 8

export default async function Home() {
  const [t, cities, groups, top, routes] = await Promise.all([
    getTotals(), getCities(), getCategoryGroups(), getTopRated(6), getSampleLists(4),
  ])
  const sheets = cities.slice(0, SHEETS)
  const [heroPts, sheetPts] = await Promise.all([
    sheets[0] ? getPoints([sheets[0].slug], 1100) : [],
    getPoints(sheets.map(c => c.slug), 160),
  ])
  const main = sheets[0]
  const centre = heroPts.length
    ? coords(heroPts.reduce((s, p) => s + p.lat, 0) / heroPts.length, heroPts.reduce((s, p) => s + p.lng, 0) / heroPts.length)
    : ''
  const categoryCount = groups.reduce((s, g) => s + g.niches.length, 0)

  return (
    <>
      <section className="hero contours">
        <div className="wrap hero-grid">
          <div className="hero-copy">
            <p className="kicker">Local business survey · {cities.length} cities</p>
            <h1>The lay of the land for <em>local business.</em></h1>
            <p className="lede">
              Addresses, phone numbers, opening hours and honest ratings for {num(t.businesses)} businesses, ranked fairly and mapped
              street by street.
            </p>
            <SearchPanel />
            {routes.length > 0 && (
              <p className="hero-routes">
                <span>Popular</span>
                {routes.map(r => (
                  <Link key={`${r.city}/${r.category}`} href={`/${r.city}/${r.category}`}>{cap(plural(r.trade))} in {r.cityName}</Link>
                ))}
              </p>
            )}
          </div>

          {main && heroPts.length > 1 && (
            <Sheet
              className="sheet-hero"
              caption={<>
                <span><b>Sheet 01 · {main.name}</b>{main.country}</span>
                <span className="mono">{centre}</span>
                <Link href={`/${main.slug}`}>Open sheet <Icon name="arrow" size={14} /></Link>
              </>}
            >
              <DotMap points={project(heroPts, 560, 460, 24)} w={560} h={460} cols={7} rows={6} title={`Where ${main.name}’s businesses are`} />
            </Sheet>
          )}
        </div>
        <div className="wrap">
          <dl className="readout">
            <div><dt>Businesses</dt><dd>{compact.format(t.businesses)}</dd></div>
            <div><dt>Cities</dt><dd>{cities.length}</dd></div>
            <div><dt>Categories</dt><dd>{categoryCount}</dd></div>
            <div><dt>Reviews weighed</dt><dd>{compact.format(t.reviews)}</dd></div>
            <div><dt>Average rating</dt><dd>{t.avg ? t.avg.toFixed(2) : '—'}</dd></div>
          </dl>
        </div>
      </section>

      <section className="sec">
        <div className="wrap">
          <SecHead kicker="Index" title="Browse by category" sub="Every group of businesses is a sheet in the series, shaded by how many businesses it holds." />
          <Sheet
            className="index-sheet"
            caption={<>
              <span className="hypso" aria-hidden="true"><span>Fewer</span><i className="idx-low" /><i className="idx-mid" /><i className="idx-high" /><i className="idx-summit" /><span>More businesses</span></span>
              <Link href="/categories">Full index of {categoryCount} categories <Icon name="arrow" size={14} /></Link>
            </>}
          >
            {/* The biggest group is a 2×2 sheet; seven more and the "all categories" sheet fill the rest of a 4×3 grid. */}
            <div className="index-map">
              {groups.slice(0, 8).map((g, i) => (
                <section key={g.slug} className={`idx-cell idx-${i === 0 ? 'summit contours' : i < 3 ? 'high' : i < 5 ? 'mid' : 'low'}`}>
                  <div className="idx-top">
                    <span className="mono">Sheet {String(i + 1).padStart(2, '0')}</span>
                    <MapSymbol group={g.name} size={i ? 20 : 28} />
                  </div>
                  <h3><Link href={`/categories#${g.slug}`}>{g.name}</Link></h3>
                  <p className="mono">{num(g.niches.reduce((s, n) => s + n.count, 0))} businesses · {g.niches.length} categories</p>
                  <p className="idx-links">
                    {[...g.niches].sort((a, b) => b.count - a.count).slice(0, i ? 4 : 10).map(n => (
                      <Link key={n.slug} href={`/categories/${n.slug}`}>{cap(plural(n.name))}</Link>
                    ))}
                  </p>
                </section>
              ))}
              <Link href="/categories" className="idx-cell idx-all">
                <span className="mono">Sheet index</span>
                <b>All {categoryCount} categories in {groups.length} groups</b>
                <Icon name="arrow" size={22} />
              </Link>
            </div>
          </Sheet>
        </div>
      </section>

      <section className="sec sec-tint">
        <div className="wrap">
          <SecHead kicker="Sheets" title="Cities we’ve mapped" sub="Each dot is a business, drawn where it stands." href="/cities" linkText={`All ${cities.length} cities`} />
          <div className="sheets">
            {sheets.map((c, i) => {
              const pts = project(sheetPts.filter(p => p.city === c.slug), 280, 180, 12)
              return (
                <Link key={c.slug} href={`/${c.slug}`} className="sheet-card">
                  <div className="sheet-card-map">
                    <span className="sheet-no mono">{String(i + 1).padStart(2, '0')}</span>
                    <DotMap points={pts} w={280} h={180} cols={4} rows={3} title={`Map of ${c.name}`} small />
                  </div>
                  <div className="sheet-card-body">
                    <h3>{c.name}</h3>
                    <p>{c.country}</p>
                    <p className="mono">{num(c.count)} businesses · {c.categories} lists</p>
                  </div>
                </Link>
              )
            })}
          </div>
        </div>
      </section>

      {top.length > 0 && (
        <section className="sec">
          <div className="wrap">
            <SecHead kicker="Benchmarks" title="The highest-rated, by a wide margin" sub="Top ratings from the most reviewers, anywhere in the survey." href="/search?sort=rating" linkText="Search by rating" />
            <div className="benchmarks">
              {top.map(b => (
                <Link key={b.key} href={`/biz/${b.slug}`} className="benchmark">
                  <Trig rating={b.rating} big />
                  <div>
                    <h3>{b.title}</h3>
                    <p>{b.categories[0]} · {[b.area, cityName(b.city)].filter(Boolean).join(', ')}</p>
                    <p className="mono">{num(b.reviews)} reviews</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>
      )}

      <section className="sec sec-tint">
        <div className="wrap">
          <SecHead kicker="Method" title="How we survey" />
          <div className="notes">
            <div>
              <svg width="28" height="28" viewBox="0 0 16 16" aria-hidden="true"><path d="M8 1.8 14.6 13.8H1.4z" fill="#c4532f" /></svg>
              <h3>Ranked fairly</h3>
              <p>A perfect score from three people shouldn’t beat a 4.7 from nine hundred. Every rating is weighed against how many people gave it.</p>
            </div>
            <div>
              <svg width="28" height="28" viewBox="0 0 16 16" aria-hidden="true"><circle cx="8" cy="8" r="6" fill="#0d5c63" /></svg>
              <h3>One consistent format</h3>
              <p>Name, address and phone written the same way on every page, so customers, maps and search engines all agree on the details.</p>
            </div>
            <div>
              <svg width="28" height="28" viewBox="0 0 16 16" aria-hidden="true"><rect x="2.5" y="2.5" width="11" height="11" rx="1" fill="#c8902a" /></svg>
              <h3>Checked by a person</h3>
              <p>Owners can add a missing business. Every request is read by a person before it’s published, and nobody can pay for a higher rank.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="cta contours">
        <div className="wrap cta-grid">
          <div>
            <p className="kicker">Free listing</p>
            <h2>Put your business on the map.</h2>
            <p>Add your name, address and phone exactly as you want them to appear everywhere. It takes a few minutes and costs nothing.</p>
            <div className="actions">
              <Link href="/add-a-business" className="btn btn-terra">Add your business <Icon name="arrow" /></Link>
              <Link href="/about" className="btn btn-ghost">How listings are checked</Link>
            </div>
          </div>
          <div className="drop" aria-hidden="true"><span /><span /><span /><Icon name="pin" size={64} /></div>
        </div>
      </section>

      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'WebSite', name: SITE.name, url: SITE.url,
        potentialAction: { '@type': 'SearchAction', target: `${SITE.url}/search?q={q}`, 'query-input': 'required name=q' },
      }} />
    </>
  )
}
