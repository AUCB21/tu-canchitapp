import {
  pgTable,
  pgEnum,
  serial,
  text,
  integer,
  boolean,
  timestamp,
  numeric,
  index,
} from 'drizzle-orm/pg-core'
import { relations } from 'drizzle-orm'

// ── Enums ──────────────────────────────────────────────────────────

export const tipoCancha = pgEnum('tipo_cancha', ['futbol5', 'futbol7'])
export const rolUsuario = pgEnum('rol_usuario', ['admin', 'staff'])
export const estadoReserva = pgEnum('estado_reserva', [
  'confirmada',
  'pendiente_pago',
  'cancelada',
])
export const metodoPago = pgEnum('metodo_pago', ['efectivo', 'transferencia'])

// ── Tables ─────────────────────────────────────────────────────────

export const canchas = pgTable('canchas', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  tipo: tipoCancha('tipo').notNull(),
  capacidad: integer('capacidad').notNull().default(10),
  orden: integer('orden').notNull().default(0),
  activa: boolean('activa').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const clientes = pgTable('clientes', {
  id: serial('id').primaryKey(),
  nombre: text('nombre').notNull(),
  telefono: text('telefono'),
  activa: boolean('activa').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const usuarios = pgTable('usuarios', {
  id: serial('id').primaryKey(),
  email: text('email').notNull().unique(),
  rol: rolUsuario('rol').notNull().default('staff'),
  hashedPassword: text('hashed_password').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const seriesRecurrentes = pgTable('series_recurrentes', {
  id: serial('id').primaryKey(),
  canchaId: integer('cancha_id')
    .notNull()
    .references(() => canchas.id),
  clienteId: integer('cliente_id')
    .notNull()
    .references(() => clientes.id),
  // 0 = Sunday, 1 = Monday, ..., 6 = Saturday (matches date-fns getDay())
  diaSemana: integer('dia_semana').notNull(),
  horaInicio: text('hora_inicio').notNull(), // "HH:mm" e.g. "21:00"
  horaFin: text('hora_fin').notNull(), // "HH:mm" e.g. "22:30"
  precio: numeric('precio', { precision: 10, scale: 2 }).notNull(), // ARS — returns string, use parseFloat()
  fechaInicio: timestamp('fecha_inicio', { withTimezone: true }).notNull(),
  fechaFin: timestamp('fecha_fin', { withTimezone: true }), // null = indefinite
  activa: boolean('activa').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true })
    .notNull()
    .defaultNow(),
})

export const reservas = pgTable(
  'reservas',
  {
    id: serial('id').primaryKey(),
    canchaId: integer('cancha_id')
      .notNull()
      .references(() => canchas.id),
    clienteId: integer('cliente_id')
      .notNull()
      .references(() => clientes.id),
    inicio: timestamp('inicio', { withTimezone: true }).notNull(), // UTC stored
    fin: timestamp('fin', { withTimezone: true }).notNull(),
    estado: estadoReserva('estado').notNull().default('confirmada'),
    precio: numeric('precio', { precision: 10, scale: 2 }).notNull(), // ARS — returns string, use parseFloat()
    notas: text('notas'),
    serieId: integer('serie_id').references(() => seriesRecurrentes.id), // null for ad-hoc
    esRecurrente: boolean('es_recurrente').notNull().default(false),
    creadoPor: integer('creado_por').references(() => usuarios.id),
    createdAt: timestamp('created_at', { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    // Primary query pattern: calendar for a court on a date
    index('idx_reservas_cancha_inicio').on(t.canchaId, t.inicio),
    // Bulk operations on a series
    index('idx_reservas_serie').on(t.serieId),
  ]
)

export const pagos = pgTable('pagos', {
  id: serial('id').primaryKey(),
  reservaId: integer('reserva_id')
    .notNull()
    .references(() => reservas.id),
  monto: numeric('monto', { precision: 10, scale: 2 }).notNull(), // ARS — returns string, use parseFloat()
  metodo: metodoPago('metodo').notNull(),
  pagadoEn: timestamp('pagado_en', { withTimezone: true })
    .notNull()
    .defaultNow(),
  notas: text('notas'),
})

// ── Relations (for db.query.* relational API) ──────────────────────

export const canchasRelations = relations(canchas, ({ many }) => ({
  reservas: many(reservas),
  series: many(seriesRecurrentes),
}))

export const clientesRelations = relations(clientes, ({ many }) => ({
  reservas: many(reservas),
  series: many(seriesRecurrentes),
}))

export const seriesRecurrentesRelations = relations(
  seriesRecurrentes,
  ({ one, many }) => ({
    cancha: one(canchas, {
      fields: [seriesRecurrentes.canchaId],
      references: [canchas.id],
    }),
    cliente: one(clientes, {
      fields: [seriesRecurrentes.clienteId],
      references: [clientes.id],
    }),
    reservas: many(reservas),
  })
)

export const reservasRelations = relations(reservas, ({ one, many }) => ({
  cancha: one(canchas, {
    fields: [reservas.canchaId],
    references: [canchas.id],
  }),
  cliente: one(clientes, {
    fields: [reservas.clienteId],
    references: [clientes.id],
  }),
  serie: one(seriesRecurrentes, {
    fields: [reservas.serieId],
    references: [seriesRecurrentes.id],
  }),
  pagos: many(pagos),
}))

export const pagosRelations = relations(pagos, ({ one }) => ({
  reserva: one(reservas, {
    fields: [pagos.reservaId],
    references: [reservas.id],
  }),
}))
