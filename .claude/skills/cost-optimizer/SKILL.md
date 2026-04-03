# SKILL: COST-OPTIMIZER [V1.1 - ADMINISTRADOR DE CANCHAS]
# OBJECTIVE: Absolute minimization of output tokens during code generation.

## [GENERATION RULES]
1. ZERO EXPLANATION: Do not explain the code. The code must be self-documenting via TypeScript types and minimal comments.
2. DIFFS ONLY: When modifying existing files, output ONLY the modified blocks using `// ... existing code ...` to skip unchanged logic.
3. NO ALTERNATIVES: Provide ONE definitive solution. Do not offer multiple approaches unless explicitly requested.

## [FORMATTING RULES]
1. Strip all trailing spaces and unnecessary empty lines.
2. Consolidate imports where possible.
3. Use strict Markdown code blocks with the correct language tag (`tsx`, `ts`, `sql`).

## [PROJECT-SPECIFIC GOTCHAS — ALWAYS APPLY]
1. NUMERIC STRINGS: Drizzle returns `numeric` columns as strings. Always `parseFloat()` before math.
   ```ts
   // WRONG: reserva.precio * 1.1
   // RIGHT: parseFloat(reserva.precio) * 1.1
   ```
2. TIMEZONE: Never use `new Date().toLocaleDateString()`. Always use `Intl.DateTimeFormat` with `timeZone: 'America/Argentina/Buenos_Aires'`.
3. SERVER ACTION GUARD: Every Server Action must start with the auth check. One pattern, no variations:
   ```ts
   const session = await auth()
   if (!session) throw new Error('Unauthorized')
   ```
4. DRIZZLE IMPORTS: Import table definitions from `@/db/schema`, the db instance from `@/db/index`.
5. ENUM VALUES: Use the string literals directly (`'confirmada'`, `'admin'`), not imported enum objects.

## [ENFORCEMENT]
If the user asks "Why did you do this?", answer in maximum 3 bullet points. No paragraphs.
