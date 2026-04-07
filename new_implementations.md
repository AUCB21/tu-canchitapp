# Tu Canchitapp — Action Plan

## Project context

Next.js 16 (App Router) · React 19 · TypeScript · Tailwind v4 · Drizzle ORM · PostgreSQL · NextAuth v5 beta · shadcn/ui · `next-themes`

Route groups: `app/(auth)/` for login, `app/(dashboard)/` for all protected pages.
Data fetching: Server Components with direct Drizzle queries in `lib/queries/`. Mutations via server actions in `lib/actions/`.
Styling: CSS custom properties with oklch in `app/globals.css`. Sidebar is always dark regardless of theme. Dot pattern on body background.

## Agent conventions

- Read the target file before making any change.
- Do not modify `db/schema.ts` or `db/migrations/`.
- Do not modify `auth.ts` or `middleware.ts`.
- Do not add new npm dependencies unless the task explicitly states one.
- After completing each block, verify the project builds cleanly with `npm run build` before proceeding.
- New Drizzle queries go in `lib/queries/`. New server actions go in `lib/actions/`.
- PostgreSQL-specific SQL (e.g. `FILTER` clause, `::int` cast) is safe to use — the project targets PG only.

---

## Block 1 — Identity and base technical debt
*No logic changes. Zero regression risk. Execute first.*

### Task 1.1 — Unify product name
**Files:** `package.json`, `app/layout.tsx`, `components/NavClient.tsx`, `components/login-form.tsx`

The product is called "Tu Canchitapp" but the codebase uses at least three different names across these files. Update every user-facing string and the package name to be consistent.

**Success criterion:** The string `"Administrador de Canchas"` does not appear anywhere in the source outside of git history.

---

### Task 1.2 — Replace font
**Files:** `app/layout.tsx`, `app/globals.css`

Replace Geist Sans (the create-next-app default, no intentional choice) with **Plus Jakarta Sans** via `next/font/google`. Update the `--font-sans` CSS variable reference in `globals.css` to point to the new font variable. Remove Geist Mono if it has no remaining usages.

**Success criterion:** The app renders with Plus Jakarta Sans. No references to `geist` remain in source files.

---

### Task 1.3 — Extract shared state constants
**Files:** `app/(dashboard)/pagos/page.tsx`, `app/(dashboard)/clientes/[id]/page.tsx`, `components/calendar/BookingBlock.tsx`

The maps of reservation state → display label and state → badge CSS classes are declared separately in each of these three files with slight variations between them. Create `lib/constants.ts`, move the canonical versions there, and replace the local declarations with imports.

Maintain two badge variants: one for light backgrounds (used in pagos), one for dark/muted backgrounds (used in the calendar).

**Success criterion:** `ESTADO_LABEL` and any badge class maps exist only in `lib/constants.ts`. All three files import from there.

---

## Block 2 — First impression and dashboard
*Requires new logic but well-contained. No changes to auth or schema.*

### Task 2.1 — Redesign the login page
**Files:** `app/(auth)/login/page.tsx`, `components/login-form.tsx`, `components/court-selector/CourtCard.tsx`

The current login is an unstyled shadcn `Card` centered on a blank background with no branding. It is the first screen any user sees.

The target layout is a two-column split on desktop: a decorative left panel using the existing `FootballPitch` SVG at low opacity alongside the product name, and a right panel with the form. On mobile, a single column with the product name above the form, both on the sidebar background color.

To reuse `FootballPitch`, export it from `CourtCard.tsx` — it is currently an internal function. The form logic in `login-form.tsx` (useActionState, loginAction, error handling, pending state) must not change. Only the wrapping markup and styles change.

**Success criterion:** Login page shows the product name and the pitch SVG as decoration on desktop. Auth behavior is identical to before.

---

### Task 2.2 — Dashboard home with daily stat cards
**Files:** `app/(dashboard)/page.tsx`, `lib/queries/dashboard.ts` (new), `components/StatCard.tsx` (new)

The dashboard home currently shows only the court grid with no summary of the day's activity. A user opening the app in the morning has no immediate context.

Create a `getDashboardStats(date)` query that returns four values for the selected date: total non-cancelled reservations, total payments collected (sum of `pagos.monto` joined through reservations starting that day), number of courts with an active reservation right now (inicio ≤ now < fin), and minutes until the next reservation (null if none remaining today).

Render four stat cards above the `CourtGrid` using a new `StatCard` component. The stat cards should update when the date changes via `DateNavigator` — pass the selected date to `getDashboardStats`.

**Success criterion:** Four stat cards appear above the court grid showing real data. Navigating to a different date updates the stats.

---

### Task 2.3 — Client list with CRM context
**Files:** `app/(dashboard)/clientes/page.tsx`, `components/clientes/ClienteList.tsx`

The client list shows name and phone only — it is a directory, not a CRM. The schema already supports richer data via joins.

Extend the query in the page to include per-client aggregates: date of last non-cancelled reservation, count of active reservations, and sum of outstanding debt (reservations with `estado = 'pendiente_pago'` where paid amount is less than price). These are all computable with `LEFT JOIN` and `GROUP BY` on the existing tables.

Update `ClienteList` to display the new fields inline below the phone number. Debt should appear as a colored badge only when greater than zero. Fields with no data (no reservations yet) should render nothing, not a zero or placeholder.

Extend the `Cliente` type passed to `ClienteList` to include the new aggregated fields — do not use `any`.

**Success criterion:** Each client row shows last reservation date, reservation count, and debt badge when applicable. Clients with no history show only name and phone as before.

---

## Block 3 — Visual polish
*No logic changes. UI only.*

### Task 3.1 — CourtCard: occupied state visual feedback
**File:** `components/court-selector/CourtCard.tsx`

When a court is occupied, the `FootballPitch` SVG looks identical to when it is free — only the border color and badge change. Add a visual overlay on the pitch area for occupied courts. A diagonal stripe pattern using CSS (no images) at low opacity is sufficient. The overlay must be positioned absolutely within the existing relative container and must not interfere with the name overlay at the bottom.

**Success criterion:** An occupied court has a visible texture or overlay on the pitch SVG. A free court has none.

---

### Task 3.2 — CourtHeader: consistent colors in the booking calendar
**File:** `components/calendar/CourtHeader.tsx`

Court column headers currently cycle through six arbitrary color gradients (sky, violet, emerald, amber, rose, indigo) based on array index. The color carries no semantic meaning — it just varies by position.

Replace this with a consistent header that uses the sidebar background color for all courts. Differentiate court type (futbol5 vs futbol7) with a small badge using the existing type badge styles from `CourtCard.tsx`. Remove the `GRADIENTS` array entirely.

**Success criterion:** All court headers have a uniform background. Court type is indicated by a badge. No color varies by court position.

---

## Block 4 — Code cleanup
*No visual or behavioral changes.*

### Task 4.1 — Document PageTransition behavior
**File:** `components/PageTransition.tsx`

The component uses `key={pathname}` on a non-list div to force React to remount on route change and re-trigger the CSS animation. This is a valid pattern but non-obvious — the next reader will likely consider it a mistake. Add a brief inline comment explaining the intent.

**Success criterion:** The comment accurately describes why `key` is used here.

---

### Task 4.2 — Move FootballPitch stripe generation out of render
**File:** `components/court-selector/CourtCard.tsx`

The stripe array for the pitch SVG is computed inside the component on every render. Since it is static data, move the computation to module level.

**Success criterion:** The stripe array is computed once at module load, not on each render.

---

### Task 4.3 — Audit unused dependencies
**Files:** `package.json`

Search the source for actual imports of `@base-ui/react`. If no component imports it, remove it from `package.json`. Do the same for `babel-plugin-react-compiler` — check whether it is referenced in `next.config.ts`; remove if not.

Do not remove any dependency that has at least one import in the source.

**Success criterion:** No dependency listed in `package.json` is entirely unused in the source.

---

## Execution order

| # | Task | Est. time | Risk |
|---|------|-----------|------|
| 1 | 1.1 Unify product name | 15 min | None |
| 2 | 1.2 Replace font | 10 min | None |
| 3 | 1.3 Extract state constants | 20 min | Low |
| 4 | 4.2 Move stripe generation | 5 min | None |
| 5 | 4.1 Document PageTransition | 5 min | None |
| 6 | 4.3 Audit dependencies | 15 min | Low |
| 7 | 2.1 Redesign login page | 2–3 h | Low |
| 8 | 2.2 Dashboard stat cards | 2–3 h | Medium |
| 9 | 2.3 Client list CRM context | 2 h | Medium |
| 10 | 3.1 CourtCard occupied overlay | 1 h | Low |
| 11 | 3.2 CourtHeader uniform colors | 30 min | Low |

**Build checkpoint:** run `npm run build` after Block 1, after Block 2, and after Block 3. Do not proceed if there are TypeScript or compilation errors.