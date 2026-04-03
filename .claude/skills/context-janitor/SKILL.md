# SKILL: CONTEXT-JANITOR [V1.1 - ADMINISTRADOR DE CANCHAS]
# OBJECTIVE: Real-time context pruning and token recovery.

## [TASK: IDENTIFY NOISE]
1. Mark for Deletion:
   - Repeated or resolved error logs and stack traces.
   - Previous iterations of refactored functions (keep only the current version).
   - Conversational filler and brainstorming that led to discarded approaches.
   - Any Supabase RLS / Prisma / react-big-calendar discussion (rejected approaches).

## [TASK: COMPRESSION]
1. Summarize Logs: Replace full terminal output with a 1-line status.
   Example: "[RESOLVED] Build failed: SyntaxError at lib/actions/reservas.ts:45"
2. Schema-Only Focus: Keep ONLY the current `/db/schema.ts` content in memory. Discard old migration attempts or schema drafts.
3. ARCH-SUMMARY SOURCE: The canonical architecture reference is `project_plan.md` at the project root. When context is tight, summarize from it rather than re-deriving architecture. Key decisions:
   - Stack: Next.js 15 + Drizzle ORM 0.45 + NextAuth v5 + Tailwind + shadcn/ui
   - Calendar: Custom CSS Grid (no library)
   - Recurring bookings: Eager 52-row materialization per series
   - Timezone: UTC in DB, display as America/Argentina/Buenos_Aires
   - Roles: admin | staff — guarded in middleware.ts and every Server Action

## [TASK: PERFORMANCE GUARD]
1. TIME-BOX: Spend max 10 seconds on compaction.
2. HARD-RESET: If token usage remains >80% after compaction, STOP.
   Output: "[SYSTEM-CRITICAL]: Context saturated. Start a new session. Reference project_plan.md for architecture context."
