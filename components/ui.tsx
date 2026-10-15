import Link from 'next/link'
import type { ReactNode } from 'react'
import { getCategoryCities, getCities, getCityCategories, getPopularNiches } from '@/lib/data'
import { SITE } from '@/lib/site'
import type { AreaCount, Business } from '@/lib/types'
import { cap, cityName, gridRef, hash, hostname, num, photoSize, plural, project, safeUrl, telHref } from '@/lib/utils'

// ---------- marks & icons ----------

// A trig-point symbol (triangle with a centre dot) on a petrol tile: the logo, and app/icon.svg.
export function Logo({ size = 34 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 32 32" aria-hidden="true" className="logo">
      <rect width="32" height="32" rx="7" fill="#c4532f" />
      <path d="M16 6.5 26 24H6z" fill="none" stroke="#fff" strokeWidth="2.4" strokeLinejoin="round" />
      <circle cx="16" cy="18" r="2.6" fill="#fff" />
    </svg>
  )
}

const ICONS = {
  pin: 'M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21Zm0-8.5a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z',
  phone: 'M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2Z',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.6 3.8 5.6 3.8 9s-1.3 6.4-3.8 9c-2.5-2.6-3.8-5.6-3.8-9S9.5 5.6 12 3Z',
  clock: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm0 4v5l3.5 2',
  search: 'M10.5 4a6.5 6.5 0 1 0 0 13 6.5 6.5 0 0 0 0-13ZM20 20l-4.8-4.8',
  arrow: 'M5 12h14m-5-5 5 5-5 5',
  route: 'M6 19a2 2 0 1 0 0-4 2 2 0 0 0 0 4Zm12-10a2 2 0 1 0 0-4 2 2 0 0 0 0 4ZM8 17h7.5a3.5 3.5 0 0 0 0-7h-7a3.5 3.5 0 0 1 0-7H16',
  check: 'm5 12.5 4.5 4.5L19 7.5',
  cross: 'M7 7l10 10M17 7 7 17',
}

export function Icon({ name, size = 16 }: { name: keyof typeof ICONS; size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" className="icon">
      <path d={ICONS[name]} />
    </svg>
  )
}

// Map-legend symbols: every category group gets a fixed shape and colour, derived from its name.
const SHAPES = [
  <circle key="0" cx="8" cy="8" r="6" />,
  <rect key="1" x="2.5" y="2.5" width="11" height="11" rx="1" />,
  <path key="2" d="M8 1.8 14.6 13.8H1.4z" />,
  <path key="3" d="M8 1 15 8 8 15 1 8z" />,
  <path key="4" d="M8 1.5 13.6 4.75v6.5L8 14.5 2.4 11.25v-6.5z" />,
  <circle key="5" cx="8" cy="8" r="4.8" fill="none" strokeWidth="3.2" stroke="currentColor" />,
  <path key="6" d="M6 2h4v4h4v4h-4v4H6v-4H2V6h4z" />,
  <path key="7" d="M8 1.5 14.5 6.3 12 14H4L1.5 6.3z" />,
]
const SYMBOL_COLORS = ['#0d5c63', '#c4532f', '#c8902a', '#5f7a2e', '#7a3b5e', '#8c4a2f', '#4b5d67', '#2f8a80']

export function MapSymbol({ group, size = 16 }: { group: string; size?: number }) {
  const h = hash(group)
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="currentColor" aria-hidden="true" className="symbol" style={{ color: SYMBOL_COLORS[(h >>> 3) % 8] }}>
      {SHAPES[h % 8]}
    </svg>
  )
}

// Rating as a survey triangle: "▲ 4.7".
export function Trig({ rating, reviews, big }: { rating?: number; reviews?: number; big?: boolean }) {
  if (!rating) return <span className="trig trig-none">Not yet rated</span>
  return (
    <span className={`trig${big ? ' trig-big' : ''}`} aria-label={`Rated ${rating.toFixed(1)} out of 5${reviews ? ` from ${num(reviews)} reviews` : ''}`}>
      <span className="trig-mark" aria-hidden="true"><b>{rating.toFixed(1)}</b></span>
      {reviews !== undefined && <small>{num(reviews)} {reviews === 1 ? 'review' : 'reviews'}</small>}
    </span>
  )
}

// ---------- chrome ----------

export function Header() {
  return (
    <header className="top">
      <div className="wrap top-row">
        <Link href="/" className="brand" aria-label={`${SITE.name} home`}>
          <Logo />
          <span><b>{SITE.name}</b><small>Local business survey</small></span>
        </Link>
        <nav className="nav" aria-label="Main">
          <Link href="/cities">Cities</Link>
          <Link href="/categories">Categories</Link>
          <Link href="/search">Search</Link>
          <Link href="/about">About</Link>
        </nav>
        <Link href="/add-a-business" className="btn btn-terra btn-sm">Add your business</Link>
      </div>
    </header>
  )
}

export async function Footer() {
  const [cities, trades] = await Promise.all([getCities(), getPopularNiches(6)])
  return (
    <footer className="foot contours">
      <div className="wrap">
        <div className="foot-grid">
          <div>
            <Link href="/" className="brand"><Logo size={30} /><span><b>{SITE.name}</b></span></Link>
            <p className="foot-blurb">{SITE.tagline}. Names, addresses, phone numbers and opening hours, kept consistent and free to use.</p>
            <div className="scalebar" aria-hidden="true"><span /><span /><span /><span /><i>0</i><i>1 km</i></div>
          </div>
          <nav aria-label="Cities">
            <h2>Cities</h2>
            <ul>{cities.slice(0, 6).map(c => <li key={c.slug}><Link href={`/${c.slug}`}>{c.name}</Link></li>)}</ul>
          </nav>
          <nav aria-label="Popular categories">
            <h2>Categories</h2>
            <ul>{trades.map(n => <li key={n.slug}><Link href={`/categories/${n.slug}`}>{cap(plural(n.name))}</Link></li>)}</ul>
          </nav>
          <nav aria-label={SITE.name}>
            <h2>{SITE.name}</h2>
            <ul>
              <li><Link href="/add-a-business">Add your business</Link></li>
              <li><Link href="/about">How we survey</Link></li>
              <li><Link href="/cities">All cities</Link></li>
              <li><Link href="/categories">All categories</Link></li>
              <li><a href={`mailto:${SITE.email}`}>{SITE.email}</a></li>
            </ul>
          </nav>
        </div>
        <p className="foot-base">
          <span>© {SITE.name}. Compiled from public sources. Please confirm details with the business before you visit.</span>
          <span className="mono">No paid placement · No pay-to-rank</span>
        </p>
      </div>
    </footer>
  )
}

export function Crumbs({ items }: { items: { name: string; href?: string }[] }) {
  return (
    <nav aria-label="Breadcrumb">
      <ol className="crumbs">
        {items.map((c, i) => (
          <li key={i}>{c.href ? <Link href={c.href}>{c.name}</Link> : <span aria-current="page">{c.name}</span>}</li>
        ))}
      </ol>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'BreadcrumbList',
        itemListElement: items.map((c, i) => ({ '@type': 'ListItem', position: i + 1, name: c.name, ...(c.href && { item: `${SITE.url}${c.href}` }) })),
      }} />
    </nav>
  )
}

// Light page head with faint contours: breadcrumbs, a mono kicker, the title and an optional lede.
export function PageHead({ crumbs, kicker, title, lede, children }: {
  crumbs: { name: string; href?: string }[]; kicker?: ReactNode; title: ReactNode; lede?: ReactNode; children?: ReactNode
}) {
  return (
    <section className="head contours">
      <div className="wrap">
        <Crumbs items={crumbs} />
        {kicker && <p className="kicker">{kicker}</p>}
        <h1>{title}</h1>
        {lede && <p className="lede">{lede}</p>}
        {children}
      </div>
    </section>
  )
}

export function SecHead({ kicker, title, sub, href, linkText = 'See all' }: { kicker: string; title: string; sub?: ReactNode; href?: string; linkText?: string }) {
  return (
    <div className="sec-head">
      <div>
        <p className="kicker">{kicker}</p>
        <h2>{title}</h2>
        {sub && <p>{sub}</p>}
      </div>
      {href && <Link href={href} className="more">{linkText} <Icon name="arrow" /></Link>}
    </div>
  )
}

export async function SearchPanel({ q, loc }: { q?: string; loc?: string }) {
  const [trades, cities] = await Promise.all([getPopularNiches(200), getCities()])
  return (
    <form action="/search" className="finder" role="search">
      <label className="finder-field">
        <span><Icon name="search" size={14} /> Business or category</span>
        <input name="q" defaultValue={q} placeholder="Dentist, bakery…" list="dl-trades" autoComplete="off" />
      </label>
      <label className="finder-field">
        <span><Icon name="pin" size={14} /> City or neighbourhood</span>
        <input name="loc" defaultValue={loc} placeholder="Anywhere" list="dl-places" autoComplete="off" />
      </label>
      <button className="btn btn-terra finder-go">Search <Icon name="arrow" /></button>
      <datalist id="dl-trades">{trades.map(n => <option key={n.slug} value={cap(n.name)} />)}</datalist>
      <datalist id="dl-places">{cities.map(c => <option key={c.slug} value={c.name}>{c.country}</option>)}</datalist>
    </form>
  )
}

export function JsonLd({ data }: { data: object }) {
  // Escape "<" so scraped text can't close the script tag.
  return <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }} />
}

// ---------- the dot map ----------

export type Plotted = { x: number; y: number; n?: number; href?: string; label?: string }
const COL_NAMES = 'ABCDEFGHIJKL'

// Businesses drawn where they stand, on a lettered grid. Dots are one path of zero-length round-capped strokes, so a
// thousand of them stay a few kilobytes. Numbered pins link to their entry.
export function DotMap({ points, w, h, cols, rows, title, small }: {
  points: Plotted[]; w: number; h: number; cols: number; rows: number; title: string; small?: boolean
}) {
  const dots = points.filter(p => !p.n)
  const pins = points.filter(p => p.n).sort((a, b) => b.n! - a.n!) // #1 drawn last, on top
  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={`dotmap${small ? ' dotmap-sm' : ''}`} role="img" aria-label={title}>
      <g className="grid">
        {Array.from({ length: cols - 1 }, (_, i) => <line key={`c${i}`} x1={((i + 1) * w) / cols} x2={((i + 1) * w) / cols} y1="0" y2={h} />)}
        {Array.from({ length: rows - 1 }, (_, i) => <line key={`r${i}`} y1={((i + 1) * h) / rows} y2={((i + 1) * h) / rows} x1="0" x2={w} />)}
      </g>
      {!small && (
        <g className="grid-labels">
          {Array.from({ length: cols }, (_, i) => <text key={`c${i}`} x={((i + 0.5) * w) / cols} y="14">{COL_NAMES[i]}</text>)}
          {Array.from({ length: rows }, (_, i) => <text key={`r${i}`} x="8" y={((i + 0.5) * h) / rows + 4}>{i + 1}</text>)}
        </g>
      )}
      <path className="dots" d={dots.map(p => `M${p.x} ${p.y}h0`).join('')} />
      {pins.map(p => (
        <a key={p.n} href={p.href} className={p.n! <= 3 ? 'pin pin-top' : 'pin'}>
          <title>{p.label}</title>
          <circle cx={p.x} cy={p.y} r="10" />
          <text x={p.x} y={p.y + 3.5}>{p.n}</text>
        </a>
      ))}
    </svg>
  )
}

// A framed dot map with a graduated neatline, like the edge of a printed sheet.
export function Sheet({ children, caption, className = '' }: { children: ReactNode; caption?: ReactNode; className?: string }) {
  return (
    <figure className={`sheet ${className}`}>
      <div className="neatline">{children}</div>
      {caption && <figcaption>{caption}</figcaption>}
    </figure>
  )
}

// ---------- businesses ----------

export function Thumb({ b, size = 160, eager }: { b: Business; size?: number; eager?: boolean }) {
  const src = safeUrl(b.thumbnail)
  const initials = b.title.replace(/[^\p{L}\p{N} ]/gu, '').split(/\s+/).filter(Boolean).slice(0, 2).map(w => w[0]).join('').toUpperCase()
  return src
    // Plain img: Google photos are already sized by their URL (photoSize).
    ? <img className="thumb" src={photoSize(src, size, size)} alt="" width={size} height={size} loading={eager ? 'eager' : 'lazy'} referrerPolicy="no-referrer" />
    : <span className="thumb thumb-blank contours" aria-hidden="true">{initials || '△'}</span>
}

export function Entry({ b, n, showCity, grid }: { b: Business; n: number; showCity?: boolean; grid?: string }) {
  const trade = b.categories[0] ?? cap(b.niches[0] ?? '')
  const where = [b.area, showCity ? cityName(b.city) : undefined].filter(Boolean).join(', ')
  const web = safeUrl(b.website)
  return (
    <article className="entry" id={`e-${n}`}>
      <span className={`entry-no${n <= 3 ? ' top' : ''}`} aria-label={`Number ${n}`}>{n}</span>
      <Link href={`/biz/${b.slug}`} className="entry-thumb" tabIndex={-1} aria-hidden="true"><Thumb b={b} /></Link>
      <div className="entry-main">
        <h3><Link href={`/biz/${b.slug}`}>{b.title}</Link></h3>
        <p className="entry-meta">{[trade, where].filter(Boolean).join(' · ')}</p>
        <ul className="nap">
          <li><Icon name="pin" size={14} />{b.address}</li>
          {b.phone && <li><Icon name="phone" size={14} /><a href={telHref(b.phone)} className="mono">{b.phone}</a></li>}
          {web && <li><Icon name="globe" size={14} /><a href={web} rel="nofollow noopener" target="_blank">{hostname(web)}</a></li>}
        </ul>
        {b.user_review && <p className="entry-quote">“{b.user_review.replace(/^"|"$/g, '')}”</p>}
      </div>
      <div className="entry-side">
        <Trig rating={b.rating} reviews={b.reviews} />
        {grid && <a href="#map" className="gridref" title="Position on the map">Grid {grid}</a>}
        <Link href={`/biz/${b.slug}`} className="btn btn-line btn-sm">Details</Link>
      </div>
    </article>
  )
}

// "Dentists in Pune" and "Dentists in Kothrud, Pune": ranked entries beside a map of where they are.
export async function ListingView({ citySlug, nicheSlug, niche, city, items, areas, area }: {
  citySlug: string; nicheSlug: string; niche: string; city: string; items: Business[]; areas: AreaCount[]; area?: AreaCount
}) {
  const [cityTrades, elsewhere] = await Promise.all([getCityCategories(citySlug), getCategoryCities(nicheSlug)])
  const place = area ? `${area.name}, ${cityName(city)}` : cityName(city)
  const title = `${cap(plural(niche))} in ${place}`
  const base = `/${citySlug}/${nicheSlug}`
  const rated = items.filter(b => b.rating)
  const avg = rated.length ? rated.reduce((s, b) => s + b.rating!, 0) / rated.length : 0

  const W = 400, H = 400, COLS = 5, ROWS = 5, PINS = 30
  const plotted = project(
    items.flatMap((b, i) => (b.gps_coordinates ? [{ lat: b.gps_coordinates.latitude, lng: b.gps_coordinates.longitude, i, b }] : [])),
    W, H, 22,
  )
  const grid = new Map(plotted.map(p => [p.b.key, gridRef(p.x, p.y, W, H, COLS, ROWS)]))

  return (
    <>
      <PageHead
        crumbs={[
          { name: 'Home', href: '/' }, { name: cityName(city), href: `/${citySlug}` },
          ...(area ? [{ name: cap(plural(niche)), href: base }, { name: area.name }] : [{ name: cap(plural(niche)) }]),
        ]}
        kicker={<>{items.length} surveyed · ranked by rating and review count</>}
        title={title}
        lede={<>{items.length} {plural(niche)} in {place}{avg ? `, averaging ${avg.toFixed(1)} out of 5` : ''}. Each rating is weighed against how many people gave it, so a handful of perfect scores can’t outrank hundreds of very good ones.</>}
      />
      <div className="wrap listing">
        <div className="entries">{items.map((b, i) => <Entry key={b.key} b={b} n={i + 1} grid={grid.get(b.key)} />)}</div>
        <aside className="listing-side">
          {plotted.length > 1 && (
            <Sheet className="sheet-sm" caption={<><span>{title}</span><span>{plotted.length} plotted · top {Math.min(PINS, items.length)} numbered</span></>}>
              <div id="map">
                <DotMap
                  points={plotted.map(p => (p.i < PINS ? { x: p.x, y: p.y, n: p.i + 1, href: `#e-${p.i + 1}`, label: p.b.title } : { x: p.x, y: p.y }))}
                  w={W} h={H} cols={COLS} rows={ROWS} title={`Map of ${title}`}
                />
              </div>
            </Sheet>
          )}
          {areas.length > 0 && (
            <div className="side-box">
              <h2>By neighbourhood</h2>
              <ul className="side-list">
                {area && <li><Link href={base}>All of {cityName(city)}</Link></li>}
                {areas.map(a => (
                  <li key={a.slug}>
                    <Link href={`${base}/${a.slug}`} aria-current={a.slug === area?.slug ? 'page' : undefined}>{a.name}<span className="mono">{a.count}</span></Link>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </aside>
      </div>
      <section className="sec sec-tint">
        <div className="wrap related">
          <div>
            <h2>More in {cityName(city)}</h2>
            <ul className="chips">
              {cityTrades.filter(t => t.slug !== nicheSlug).slice(0, 24).map(t => (
                <li key={t.slug}><Link href={`/${citySlug}/${t.slug}`}><MapSymbol group={t.group} size={11} />{cap(plural(t.name))}<span>{t.count}</span></Link></li>
              ))}
            </ul>
          </div>
          <div>
            <h2>{cap(plural(niche))} in other cities</h2>
            <ul className="chips">
              {elsewhere.filter(c => c.slug !== citySlug).slice(0, 24).map(c => (
                <li key={c.slug}><Link href={`/${c.slug}/${nicheSlug}`}>{c.name}<span>{c.count}</span></Link></li>
              ))}
            </ul>
          </div>
        </div>
      </section>
      <JsonLd data={{
        '@context': 'https://schema.org', '@type': 'ItemList', name: title, numberOfItems: items.length,
        itemListElement: items.slice(0, 50).map((b, i) => ({ '@type': 'ListItem', position: i + 1, url: `${SITE.url}/biz/${b.slug}`, name: b.title })),
      }} />
    </>
  )
}
