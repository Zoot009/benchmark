# Benchmark

A free local business directory (local citations): ranked "best of" pages per city, category and neighbourhood, plus a page per business with its name, address, phone, opening hours and map.

It shares web6's database and data layer (`lib/data.ts`, `lib/db.ts`, `lib/actions.ts`, `lib/validate.ts`); only the design differs. The look is a survey map:
deep petrol and sea-mist, terracotta for actions, ochre survey triangles for ratings, Schibsted Grotesk text and Martian Mono for coordinates and labels.
Cities, listings and the home page draw businesses as dot maps from their real coordinates (`DotMap` and `project` in `lib/utils.ts`), framed by a graduated
map neatline. Contour lines come from `public/contours.svg`, used as a CSS mask so any element can carry them in any colour. Each category group has a fixed
map-legend symbol (`MapSymbol` in `components/ui.tsx`).

```bash
npm install
npm run dev      # http://localhost:3000
npm test         # unit checks for slugs, plurals, survey marks and the dot-map projection
npm run build
```

- **Database:** listings are read from the shared Postgres (Supabase). Put the read-only login in `.env.local` (see `.env.example`):
  ```
  WEB_DATABASE_URL=postgresql://web_reader.<project>:<password>@aws-0-<region>.pooler.supabase.com:5432/postgres
  ```
  Use port **5432** (Supabase's session pooler). The site needs `SELECT` on `businesses`, `categories`, `cities`, `business_categories` and the
  `city_category_counts` and `listing_areas` views.
- **Adding businesses:** the form inserts into `listing_requests` through `WEB_FORMS_DATABASE_URL` (insert-only), stamped with this site's domain.
- **Publishing rules:** a city + category page needs 5+ businesses, an area page 3+ (`lib/site.ts`).
