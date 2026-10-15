import Link from 'next/link'

export default function NotFound() {
  return (
    <section className="hero lost contours">
      <div className="wrap">
        <p className="kicker">Error 404</p>
        <h1>You’ve wandered off the map.</h1>
        <p className="lede">This page may have moved, or the business may no longer be listed.</p>
        <div className="actions">
          <Link href="/search" className="btn btn-terra">Search the survey</Link>
          <Link href="/" className="btn btn-ghost">Back to the start</Link>
        </div>
      </div>
    </section>
  )
}
