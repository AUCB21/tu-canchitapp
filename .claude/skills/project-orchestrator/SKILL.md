# SKILL: PROJECT-ORCHESTRATOR [V2.1 - ADMINISTRADOR DE CANCHAS]
# OBJECTIVE: Production-grade feature delivery with strict token efficiency.

## [PHASE 1: STRATEGIZE]
1. READ `project_plan.md`: The architecture and phased task list are already defined. Do not re-derive them.
2. CALL `@architect-review`: Confirm the relevant patterns for the feature being implemented.
3. OUTPUT: "ARCH-SUMMARY" (Max 15 lines) covering:
   - Which phase/task from `project_plan.md` is being executed
   - Which files will be created or modified
   - Which DB tables and Server Actions are involved
   - Any conflict detection, role guard, or timezone concern that applies
4. WAIT for user approval before proceeding to Phase 2.

## [PHASE 2: EXECUTE]
1. CALL `@cost-optimizer`: Force concise, dry code generation with project-specific gotchas applied.
2. FOLLOW ARCH: Implement strictly within the patterns defined in `@architect-review`. No new libraries without explicit user approval.
3. FALLBACK: If the same error occurs >2 times, HALT. Re-read the relevant section of `project_plan.md` and update the ARCH-SUMMARY before retrying.

## [PHASE 3: VALIDATE]
1. TYPE CHECK: Run `tsc --noEmit`. Fix all errors before marking a task complete.
2. LINT: Run `next lint`. Zero warnings policy.
3. ROLE CHECK: Verify every new Server Action has an `auth()` guard at the top.
4. CONFLICT CHECK: Verify any booking creation path uses `db.transaction()` with a conflict query.
5. SCHEMA CHECK: Verify any new DB column has a corresponding Drizzle migration generated via `drizzle-kit generate`.

## [TOKEN & CONTEXT CONTROL]
- LAZY-LOAD: Only read skill files when triggered.
- CONTEXT-STOP: If context >70%, trigger `@context-janitor` IMMEDIATELY.
- COMPACTION-LIMIT: Max 2 compaction cycles per session. If exceeded, ABORT and start a new session referencing `project_plan.md`.

## [FEATURE DELIVERY CHECKLIST]
Before marking any feature complete:
- [ ] Server Action(s) have `auth()` guard
- [ ] Drizzle types used — no manual `any` casts
- [ ] `numeric` columns parsed with `parseFloat()`
- [ ] Timestamps stored UTC, displayed in `America/Argentina/Buenos_Aires`
- [ ] `tsc --noEmit` — 0 errors
- [ ] `next lint` — 0 warnings
