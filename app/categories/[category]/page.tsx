import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { Icon, MapSymbol, PageHead } from '@/components/ui'
import { getCategory, getCategoryCities, getPopularNiches } from '@/lib/data'
import { cap, num, plural } from '@/lib/utils'

export async function generateStaticParams() {
  return (await getPopularNiches(20)).map(n => ({ category: n.slug }))
}

export async function generateMetadata({ params }: PageProps<'/categories/[category]'>): Promise<Metadata> {
  const t = await getCategory((await params).category)
  if (!t) return {}
  return {
    title: `${cap(plural(t.name))} by city`,
    description: `${num(t.count)} ${plural(t.name)} surveyed. Choose a city for a ranked list with addresses, phone numbers and ratings.`,
    alternates: { canonical: `/categories/${t.slug}` },
  }
}

export default async function CategoryPage({ params }: PageProps<'/categories/[category]'>) {
  const t = await getCategory((await params).category)
  if (!t) notFound()
  const cities = await getCategoryCities(t.slug)
  const name = cap(plural(t.name))
  const max = Math.max(1, ...cities.map(c => c.count))
  return (
    <>
      <PageHead
        crumbs={[{ name: 'Home', href: '/' }, { name: 'Categories', href: '/categories' }, { name }]}
        kicker={<><MapSymbol group={t.group} size={12} /> {t.group} · {num(t.count)} businesses</>}
        title={name}
        lede={`${name} have a ranked list in ${cities.length} ${cities.length === 1 ? 'city' : 'cities'}. Choose one.`}
      />
      <section className="sec">
        <div className="wrap">
          <ol className="bars">
            {cities.map(c => (
              <li key={c.slug}>
                <Link href={`/${c.slug}/${t.slug}`}>
                  <span><b>{name} in {c.name}</b></span>
                  <span className="bar" aria-hidden="true"><span style={{ width: `${(c.count / max) * 100}%` }} /></span>
                  <span className="mono">{c.count}</span>
                  <Icon name="arrow" />
                </Link>
              </li>
            ))}
          </ol>
        </div>
      </section>
    </>
  )
}
