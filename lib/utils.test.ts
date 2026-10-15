import assert from 'node:assert/strict'
import { test } from 'node:test'
import { coords, gridRef, plural, project, recordNo, safeUrl } from './utils.ts'

test('survey marks are stable, well-formed and differ for neighbouring ids', () => {
  assert.equal(recordNo('12345'), recordNo('12345'))
  assert.match(recordNo('12345'), /^BM-[0-9A-F]{4}-[0-9A-F]{4}$/)
  assert.notEqual(recordNo('12345').slice(0, 7), recordNo('12346').slice(0, 7))
})

test('plurals for headings', () => {
  assert.equal(plural('dentist'), 'dentists')
  assert.equal(plural('pharmacy'), 'pharmacies')
  assert.equal(plural('car wash'), 'car washes')
  assert.equal(plural('car repair'), 'car repair')
})

test('only http(s) links from scraped data', () => {
  assert.equal(safeUrl('javascript:alert(1)'), undefined)
  assert.equal(safeUrl('https://example.com'), 'https://example.com')
})

test('coordinates read with hemispheres', () => {
  assert.equal(coords(18.52041, 73.85674), '18.5204° N  73.8567° E')
  assert.equal(coords(-33.8688, -70.6693), '33.8688° S  70.6693° W')
})

test('dot maps keep points in the box, north up, and drop far outliers', () => {
  const city = Array.from({ length: 40 }, (_, i) => ({ lat: 18.5 + (i % 8) * 0.01, lng: 73.8 + Math.floor(i / 8) * 0.01 }))
  const pts = project([...city, { lat: 40, lng: 10 }], 400, 300, 10) // last one geocoded to another continent
  assert.equal(pts.length, 40)
  assert.ok(pts.every(p => p.x >= 0 && p.x <= 400 && p.y >= 0 && p.y <= 300))
  const north = pts.find(p => p.lat === 18.57)!, south = pts.find(p => p.lat === 18.5)!
  assert.ok(north.y < south.y)
  assert.deepEqual(project([{ lat: 1, lng: 2 }], 100, 100).map(p => [p.x, p.y]), [[50, 50]])
  assert.deepEqual(project([], 100, 100), [])
})

test('grid references', () => {
  assert.equal(gridRef(0, 0, 400, 300, 8, 6), 'A1')
  assert.equal(gridRef(400, 300, 400, 300, 8, 6), 'H6')
  assert.equal(gridRef(130, 160, 400, 300, 8, 6), 'C4')
})
