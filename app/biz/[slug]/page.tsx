import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CopyButton } from '@/components/client'
import { Crumbs, Icon, JsonLd, Sheet, Thumb, Trig } from '@/components/ui'
import { getBusiness, getListing, getSimilar, getTopRated } from '@/lib/data'
import { SITE } from '@/lib/site'
import type { Business } from '@/lib/types'
import { cap, cityName, coords, directionsUrl, featureLabel, hostname, mapEmbedUrl, num, plural, recordNo, safeUrl, telHref } from '@/lib/utils'

export async function generateStaticParams() {
  return (await getTopRated(40)).map(b => ({ slug: b.slug }))
}

export async function generateMetadata({ params }: PageProps<'/biz/[slug]'>): Promise<Metadata> {
  const b = await getBusiness((await params).slug)
  if (!b) return {}
  const where = [b.area, cityName(b.city)].filter(Boolean).join(', ')
  return {
    title: `${b.title}, ${b.categories[0] ?? cap(b.niches[0] ?? 'business')} in ${where}`,
    description: `${b.title}, ${b.address}.${b.phone ? ` Phone ${b.phone}.` : ''} Opening hours, rating and directions.`,
    alternates: { canonical: `/biz/${b.slug}` },
  }
}

const DAYS = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']

// Google's extras ([{ accessibility: [...] }, ...]) plus yes/no service options, as labelled groups. The scraped data repeats
// itself (service_options in both places, "Wi-Fi" twice), so groups and items are merged by name.
function amenities(b: Business) {
  const groups = new Map<string, Map<string, boolean>>()
  const add = (group: string, label: string, yes: boolean) => groups.set(group, (groups.get(group) ?? new Map()).set(label, yes))
  for (const [k, v] of Object.entries(b.service_options ?? {})) add('Service options', featureLabel(k), v)
  for (const ext of b.extensions ?? []) {
    for (const [k, v] of Object.entries(ext)) if (Array.isArray(v)) v.forEach(label => add(featureLabel(k), String(label), true))
  }
  return [...groups].map(([name, items]) => ({ name, items: [...items].map(([label, yes]) => ({ label, yes })) }))
}

export default async function BusinessPage({ params }: PageProps<'/biz/[slug]'>) {
  const b = await getBusiness((await params).slug)
  if (!b) notFound()
  const [listing, similar] = await Promise.all([b.nicheSlugs[0] ? getListing(b.citySlug, b.nicheSlugs[0]) : undefined, getSimilar(b)])
  const rank = listing ? listing.items.findIndex(x => x.key === b.key) + 1 : 0
  const city = cityName(b.city)
  const trade = b.categories[0] ?? cap(b.niches[0] ?? '')
  const web = safeUrl(b.website)
  const hours = Object.fromEntries(Object.entries(b.operating_hours ?? {}).map(([d, h]) => [d.toLowerCase(), h]))
  const days = DAYS.filter(d => hours[d])
  const extras = amenities(b)
  const nap = [b.title, b.address, b.phone, web].filter(Boolean).join('\n')
  const gps = b.gps_coordinates
  const mapQuery = gps ? `${gps.latitude},${gps.longitude}` : `${b.title}, ${b.address}`

  return (
    <>
      <section className="head contours">
        <div className="wrap biz-head">
          <div>
            <Crumbs items={[
              { name: 'Home', href: '/' }, { name: city, href: `/${b.citySlug}` },
              ...(listing ? [{ name: cap(plural(listing.niche)), href: `/${b.citySlug}/${listing.nicheSlug}` }] : []),
              { name: b.title },
            ]} />
            <p className="kicker">Survey mark {recordNo(b.key)}</p>
            <h1>{b.title}</h1>
            <p className="biz-sub">{trade} in {[b.area, b.city].filter(Boolean).join(', ')}</p>
            <div className="biz-tags">
              {rank > 0 && listing && <Link href={`/${b.citySlug}/${listing.nicheSlug}#e-${rank}`} className="tag tag-terra">No. {rank} of {listing.items.length} {plural(listing.niche)} in {city}</Link>}
              {b.price && <span className="tag">{b.price}</span>}
              {b.unclaimed_listing && <span className="tag">Not yet claimed by its owner</span>}
            </div>
            <div className="actions">
              {b.phone && <a href={telHref(b.phone)} className="btn btn-terra"><Icon name="phone" /> Call {b.phone}</a>}
              {web && <a href={web} className="btn btn-line" rel="nofollow noopener" target="_blank"><Icon name="globe" /> {hostname(web)}</a>}
              <a href={directionsUrl(b.address, b.place_id)} className="btn btn-line" rel="noopener" target="_blank"><Icon name="route" /> Directions</a>
            </div>
          </div>
          <figure className="biz-photo">
            <Thumb b={b} size={560} eager />
            {gps && <figcaption className="mono">{coords(gps.latitude, gps.longitude)}</figcaption>}
          </figure>
        </div>
      </section>

      <div className="wrap biz-body">
        <div className="biz-main">
          <section className="panel">
            <h2>Contact details</h2>
            <dl className="facts">
              <dt>Name</dt><dd>{b.title}</dd>
              <dt>Address</dt><dd>{b.address}</dd>
              {b.phone && <><dt>Phone</dt><dd><a href={telHref(b.phone)} className="mono">{b.phone}</a></dd></>}
              {web && <><dt>Website</dt><dd><a href={web} rel="nofollow noopener" target="_blank">{hostname(web)}</a></dd></>}
              <dt>Category</dt><dd>{[trade, ...b.categories.slice(1)].join(', ')}</dd>
              {b.area && <><dt>Neighbourhood</dt><dd>{b.area}</dd></>}
              <dt>City</dt><dd><Link href={`/${b.citySlug}`}>{b.city}</Link></dd>
            </dl>
            <div className="panel-foot">
              <span>Name, address and phone, written the way they should read everywhere.</span>
              <CopyButton text={nap} />
            </div>
          </section>

          {days.length > 0 && (
            <section className="panel">
              <h2><Icon name="clock" /> Opening hours</h2>
              <table className="hours">
                <tbody>{days.map(d => <tr key={d}><th scope="row">{cap(d)}</th><td className={/closed/i.test(hours[d]) ? 'closed' : undefined}>{hours[d]}</td></tr>)}</tbody>
              </table>
              <p className="note">As published by the business. Holidays may differ.</p>
            </section>
          )}

          {b.description && (
            <section className="panel">
              <h2>About</h2>
              <p className="prose">{b.description}</p>
            </section>
          )}

          {extras.length > 0 && (
            <section className="panel">
              <h2>Amenities</h2>
              <div className="amenities">
                {extras.map(g => (
                  <div key={g.name}>
                    <h3>{g.name}</h3>
                    <ul>{g.items.map(i => <li key={i.label} className={i.yes ? undefined : 'no'}><Icon name={i.yes ? 'check' : 'cross'} size={14} />{i.label}</li>)}</ul>
                  </div>
                ))}
              </div>
            </section>
          )}

          <section className="panel">
            <h2><Icon name="pin" /> Location</h2>
            <Sheet caption={<><span>{b.address}</span><a href={directionsUrl(b.address, b.place_id)} rel="noopener" target="_blank">Get directions <Icon name="arrow" size={14} /></a></>}>
              <iframe className="map" src={mapEmbedUrl(mapQuery)} title={`Map of ${b.title}`} loading="lazy" referrerPolicy="no-referrer-when-downgrade" />
            </Sheet>
          </section>
        </div>

        <aside className="biz-side">
          <section className="panel score-panel">
            <h2>Rating</h2>
            <Trig rating={b.rating} big />
            <p>
              {b.rating ? <>Out of 5, from {num(b.reviews)} {b.reviews === 1 ? 'review' : 'reviews'} on Google.</> : 'No ratings yet.'}
              {rank > 0 && listing && <> Ranked <b>No. {rank}</b> of {listing.items.length} {plural(listing.niche)} in {city}.</>}
            </p>
            {b.user_review && (
              <blockquote>
                <p>“{b.user_review.replace(/^"|"$/g, '')}”</p>
                <footer>A Google reviewer</footer>
              </blockquote>
            )}
          </section>

          {similar.length > 0 && (
            <section className="panel">
              <h2>Nearby alternatives</h2>
              <ul className="nearby">
                {similar.map(s => (
                  <li key={s.key}>
                    <Link href={`/biz/${s.slug}`}>
                      <span><b>{s.title}</b><small>{s.area ?? s.address}</small></span>
                      <span className="mono">{s.rating?.toFixed(1) ?? '—'}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          <p className="note">Something wrong? Write to <a href={`mailto:${SITE.email}?subject=${encodeURIComponent(`Correction ${recordNo(b.key)}`)}`}>{SITE.email}</a> quoting survey mark {recordNo(b.key)}.</p>
        </aside>
      </div>

      <JsonLd data={{
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        '@id': `${SITE.url}/biz/${b.slug}`,
        name: b.title,
        url: `${SITE.url}/biz/${b.slug}`,
        ...(web && { sameAs: [web] }),
        ...(b.phone && { telephone: b.phone }),
        ...(safeUrl(b.thumbnail) && { image: safeUrl(b.thumbnail) }),
        ...(b.price && { priceRange: b.price }),
        ...(b.description && { description: b.description }),
        address: { '@type': 'PostalAddress', streetAddress: b.address, addressLocality: city },
        ...(gps && { geo: { '@type': 'GeoCoordinates', latitude: gps.latitude, longitude: gps.longitude } }),
        ...(b.rating && b.reviews && { aggregateRating: { '@type': 'AggregateRating', ratingValue: b.rating, reviewCount: b.reviews, bestRating: 5 } }),
      }} />
    </>
  )
}
