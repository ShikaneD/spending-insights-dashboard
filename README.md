# Customer Spending Insights Dashboard

A responsive spending dashboard built with React 18, TypeScript and Vite. There is no backend, so
[MSW](https://mswjs.io) answers real `fetch` calls to the 7 endpoints in the supplied API spec.
Set `VITE_ENABLE_MOCKS=false` to skip the mocks and call a real API at the same URLs.

## Run

**Docker** (serves on http://localhost:8080):

```bash
docker build -t spending-insights-dashboard .
docker run --rm -p 8080:8080 spending-insights-dashboard
```
Verified: the Docker image builds and serves the app on port 8080 (checked in a GitHub Codespace).

**Local** (Node 20+):

```bash
npm install      # also generates public/mockServiceWorker.js
npm run dev      # http://localhost:5173
```

## Test and check

```bash
npm test            # Vitest + React Testing Library, API mocked with MSW in Node
npm run lint
npm run typecheck
npm run build
```

CI (`.github/workflows/ci.yml`) runs lint, typecheck, tests, build and a Docker build.

## Demo error states

Add `?mockError=<name>` to the URL, e.g. `http://localhost:5173/?mockError=goals`. Names: `profile`, `summary`,
`categories`, `trends`, `goals`, `transactions`, `filters`. That section shows an error with "Try again"; the rest of the page keeps working.

## Structure

```
src/
  api/        Zod schemas, fetch client (validates every response), one TanStack Query hook per endpoint
  mocks/      MSW handlers, responses.ts (the spec's sample payloads) and a seeded generator for everything
              the samples cannot cover
  features/   filters, summary, categories, trends, goals, transactions
  components/ Section (loading / error / empty / content states), Header, CategoryIcon
  lib/        formatting, icon and status maps with fallbacks
```

## Mock data

- The **default view** (last 30 days, no custom range) returns the sample responses from the spec verbatim: profile, summary, categories, trends, goals and filters. The first two transactions are the spec's samples too.
- Everything the samples cannot support is **generated** (seeded, so it is repeatable): the 7-day, 90-day and 1-year presets, custom date ranges, category filtering, sorting, and the remaining 1,248 of the 1,250 transactions.
- Because the spec's sample numbers do not reconcile with any real set of transactions, the generated views will not add up against the default overview.

## Design decisions

- **Validate at the boundary.** Zod parses each response in `api/client.ts`; a malformed payload becomes one clear error state instead of a crash inside a chart.
- **One query per section.** Each section loads, fails and retries independently (`Section` component).
- **Custom range overrides the preset.** The spec does not define precedence. Picking a preset clears the custom range.
- **Money is never calculated in the UI.** Values are only formatted with `Intl.NumberFormat('en-ZA')`. The mock sums in integer cents.
- **Charts are plain HTML/CSS** (conic-gradient donut, bars). No chart library to maintain, and each has a text alternative (list / visually hidden table).
- **Accessibility.** Labelled controls, `aria-pressed` presets, keyboard focus styles, `role="alert"` errors, change indicators use arrows and text (never colour alone), reduced-motion respected, light and dark themes.
- **Security.** Non-root nginx image, CSP and other security headers (`nginx.conf`), no sensitive data in URLs or logs. CSP allows inline styles because the donut and bars use inline `style`.

## Assumptions and questions for the API owners

| Observation in the spec | What I did |
|---|---|
| Category `transactionCount`s sum to 53, but the summary says 47 | Show each endpoint's data as returned |
| Category percentages sum to 99.9 and are not sorted by amount | Display percentages as given, sort by amount in the UI |
| `period` vs `startDate`/`endDate` precedence is undefined | Custom range wins |
| Summary endpoint documents only `period` | Mock also accepts `startDate`/`endDate` so the overview matches a custom range |
| Transactions endpoint has no `period` | Presets do not filter the table; a custom range does |
| Goal `status` shows only `on_track` and `warning` | Unknown values get a neutral label instead of crashing |
| Goals have no `icon` field | A generic icon is shown |
| Money is sent as JSON floats | Format only; recommend integer minor units or strings in a real API |
| Sample dates are in 2024 | The mock treats 2024-09-16 as "today" so the presets return data |
| Trends sample covers 6 months, but `months` allows up to 24 | The mock returns the six sample months, whatever `months` asks for |
| Sample transactions show 2 rows against a total of 1,250 | The two samples come first, followed by 1,248 generated rows |

## Not done / next steps

- Filters in URL search params (shareable, survive refresh) and a month selector for the trend.
- Per-category icons on goals, and values on the trend bars.
- Error boundary per section (query errors are already isolated per section; render errors fall back to the app-level boundary).
- Prettier config, Playwright smoke test, and a real backend (the API contract is unchanged, so this is a swap).
- `npm audit --omit=dev` reports 0 vulnerabilities. The remaining advisories are in dev tooling (Vite, Vitest); I would upgrade these to the latest majors.
