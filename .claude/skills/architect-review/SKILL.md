# SKILL: ARCHITECT-REVIEW [CUSTOM - NEXT.JS / DRIZZLE / NEXTAUTH]
# OBJECTIVE: Enforce strict architectural and security patterns for this project's stack.

## [NEXT.JS APP ROUTER RULES]
1. SERVER-FIRST: All components are Server Components by default.
2. ISOLATE CLIENT: Use `'use client'` strictly at the lowest possible leaf nodes (buttons, form inputs, interactive calendars).
3. MUTATIONS: Use Server Actions in `/lib/actions/` for ALL data mutations. Never use `route.ts` files for internal mutations.
4. SERVER ACTIONS: Every Server Action must call `auth()` first and throw if session is null or role is insufficient.

## [DRIZZLE ORM RULES]
1. SCHEMA IS TRUTH: All table definitions live in `/db/schema.ts`. Never write raw SQL migrations by hand — use `drizzle-kit generate`.
2. TRANSACTIONS FOR CONFLICTS: Booking creation and turno fijo materialization MUST run inside `db.transaction()` with a `SELECT FOR UPDATE` conflict check before any INSERT.
3. NUMERIC TRAP: Drizzle returns `numeric(10,2)` columns as JavaScript **strings**, not numbers. Always `parseFloat()` before arithmetic (e.g., `parseFloat(reserva.precio)`).
4. TIMESTAMPS ARE UTC: Store all datetimes with `{ withTimezone: true }`. Display with `Intl.DateTimeFormat` and `timeZone: 'America/Argentina/Buenos_Aires'`. Never store local time.
5. NO RAW QUERIES: Use the Drizzle query builder. Avoid `db.execute(sql\`...\`)` unless absolutely necessary (e.g., advisory locks).

## [AUTH & ROLE GUARD RULES]
1. TWO ROLES ONLY: `admin` and `staff`. The `rol` claim lives in the JWT and is exposed via `session.user.rol`.
2. MIDDLEWARE GUARDS routes: `/admin/*` requires `rol === 'admin'`. All dashboard routes require a valid session. See `middleware.ts`.
3. SERVER ACTION GUARDS: Pattern is always:
   ```ts
   const session = await auth()
   if (!session) throw new Error('Unauthorized')
   if (session.user.rol !== 'admin') throw new Error('Forbidden')
   ```
4. NEVER TRUST CLIENT ROLE: Do not read role from request body or query params. Only read from `session.user.rol`.

## [TYPESCRIPT RULES]
1. STRICT MODE: `any` is prohibited. Use `unknown` and narrow with type guards.
2. INFER FROM SCHEMA: Use Drizzle's `InferSelectModel` / `InferInsertModel` for all DB types. Do not manually re-type query results.
   ```ts
   import type { InferSelectModel } from 'drizzle-orm'
   import { reservas } from '@/db/schema'
   type Reserva = InferSelectModel<typeof reservas>
   ```
3. ENUM TYPES: Use the exported pgEnum values as TypeScript types (e.g., `'confirmada' | 'pendiente_pago' | 'cancelada'`).

## [CALENDAR RULES]
1. CUSTOM CSS GRID ONLY: Do not introduce react-big-calendar or FullCalendar. The calendar is a CSS Grid with `gridTemplateColumns: "64px repeat(N, 1fr)"` and `gridTemplateRows: "48px repeat(16, 56px)"` for 08:00–24:00.
2. ROW MATH: `gridRowStart = ((startHour - 8) * 60 + startMinute) / 60 + 2`. Slot height = 56px per hour.
3. CONFLICT PREVENTION: Optimistic UI must be validated server-side in the Server Action before committing.

## [TURNO FIJO RULES]
1. EAGER MATERIALIZATION: When a `series_recurrentes` row is created, immediately INSERT 52 individual `reservas` rows in the same transaction (1 year of weekly occurrences).
2. INDIVIDUAL CANCEL: UPDATE a single `reservas` row to `cancelada`. Do NOT delete it.
3. BULK CANCEL: UPDATE all `reservas` WHERE `serie_id = X AND inicio > NOW()` to `cancelada`, then set `series_recurrentes.fecha_fin = NOW()`.
