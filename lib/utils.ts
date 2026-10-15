export const slugify = (s: string) =>
  s.normalize('NFKD').replace(/[̀-ͯ'’]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')

export const cap = (s: string) => s.charAt(0).toUpperCase() + s.slice(1)

// "dentist" → "dentists", for "Dentists in Pune" headings. Title-cased labels and service nouns stay as they are.
export const plural = (s: string) =>
  /\s/.test(s) && s.split(/\s+/).every(w => /^[A-Z&]/.test(w)) ? s
  : /(s|repair|cleaning|care|law|massage|control|laundry)$/i.test(s) ? s
  : /(sh|ch|x)$/i.test(s) ? `${s}es`
  : /[^aeiou]y$/i.test(s) ? `${s.slice(0, -1)}ies`
  : `${s}s`

export const cityName = (city: string) => city.split(',')[0].trim()

// Lower case without accents, for matching what people type: "sao paulo" finds São Paulo.
export const fold = (s: string) => s.normalize('NFD').replace(/\p{M}/gu, '').toLowerCase().trim()

// searchParams values can be string | string[] | undefined; we only ever want one string.
export const one = (v: string | string[] | undefined) => (typeof v === 'string' ? v : undefined)

// Scraped data is untrusted: only ever emit http(s) links.
export const safeUrl = (url?: string) => (url && /^https?:\/\//i.test(url) ? url : undefined)

// Google photo URLs end in a size such as "=w163-h92-k-no"; ask for the size we actually display.
export const photoSize = (url: string, w: number, h: number) => url.replace(/=w\d+-h\d+[^/=]*$/, `=w${w}-h${h}-k-no`)

export const hostname = (url: string) => url.replace(/^https?:\/\/(www\.)?/i, '').replace(/\/.*$/, '')

export const telHref = (phone: string) => `tel:${phone.replace(/[^\d+]/g, '')}`

export const featureLabel = (key: string) => cap(key.replace(/_/g, ' '))

export const num = (n: number) => n.toLocaleString('en-US')

// FNV-1a plus a final mix, so neighbouring ids (12345, 12346) get unrelated hashes.
export const hash = (s: string) => {
  let h = 0x811c9dc5
  for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 0x01000193)
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b)
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35)
  return (h ^ (h >>> 16)) >>> 0
}

// A stable survey mark per business, like a benchmark number: "BM-04A7-91C2".
export const recordNo = (id: string) => {
  const hex = hash(id).toString(16).toUpperCase().padStart(8, '0')
  return `BM-${hex.slice(0, 4)}-${hex.slice(4)}`
}

// 18.52041, 73.85674 → "18.5204° N  73.8567° E"
export const coords = (lat: number, lng: number) =>
  `${Math.abs(lat).toFixed(4)}° ${lat < 0 ? 'S' : 'N'}  ${Math.abs(lng).toFixed(4)}° ${lng < 0 ? 'W' : 'E'}`

// Dot maps: fits points into a w×h box (longitude shrunk by cos(latitude), so a city keeps its shape). The farthest 3% on
// each side don't count towards the bounds, so one mis-geocoded business can't squash the rest; points left outside are dropped.
export function project<T extends { lat: number; lng: number }>(pts: T[], w: number, h: number, pad = 0) {
  if (!pts.length) return []
  const at = (a: number[], p: number) => [...a].sort((x, y) => x - y)[Math.min(a.length - 1, Math.floor(p * a.length))]
  const k = Math.cos((at(pts.map(p => p.lat), 0.5) * Math.PI) / 180)
  const xs = pts.map(p => p.lng * k), ys = pts.map(p => p.lat)
  const trim = pts.length >= 20 ? 0.03 : 0
  const x0 = at(xs, trim), x1 = at(xs, 1 - trim), y0 = at(ys, trim), y1 = at(ys, 1 - trim)
  // At least ~1 km across, so five shops on one street don't fill the whole frame.
  const s = Math.min((w - 2 * pad) / Math.max(x1 - x0, 0.01), (h - 2 * pad) / Math.max(y1 - y0, 0.01))
  const ox = (w - (x1 - x0) * s) / 2, oy = (h - (y1 - y0) * s) / 2
  const r = (n: number) => Math.round(n * 10) / 10
  return pts.flatMap((p, i) => {
    const x = ox + (xs[i] - x0) * s, y = oy + (y1 - ys[i]) * s
    return x < 0 || x > w || y < 0 || y > h ? [] : [{ ...p, x: r(x), y: r(y) }]
  })
}

// Map-style grid reference for a projected point: columns A, B, C… left to right, rows 1, 2, 3… top to bottom.
export const gridRef = (x: number, y: number, w: number, h: number, cols: number, rows: number) =>
  `${String.fromCharCode(65 + Math.min(cols - 1, Math.floor((x / w) * cols)))}${Math.min(rows, Math.floor((y / h) * rows) + 1)}`

export const directionsUrl = (address: string, placeId?: string) =>
  `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}${
    placeId ? `&destination_place_id=${encodeURIComponent(placeId)}` : ''
  }`

// No API key needed: Google's embeddable map for one address.
export const mapEmbedUrl = (q: string) => `https://www.google.com/maps?q=${encodeURIComponent(q)}&output=embed`
