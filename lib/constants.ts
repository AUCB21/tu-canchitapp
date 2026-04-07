/** Display labels for reservation states. */
export const ESTADO_LABEL: Record<string, string> = {
  confirmada: 'Confirmada',
  pendiente_pago: 'Pend. pago',
  cancelada: 'Cancelada',
}

/** Badge classes for light backgrounds (e.g. pagos table). */
export const ESTADO_BADGE_LIGHT: Record<string, string> = {
  confirmada: 'bg-emerald-100 text-emerald-700',
  pendiente_pago: 'bg-amber-100 text-amber-700',
  cancelada: 'bg-red-100 text-red-700',
}

/** Badge classes for dark/muted backgrounds (e.g. calendar, client history). */
export const ESTADO_BADGE_DARK: Record<string, string> = {
  confirmada: 'bg-emerald-500/15 text-emerald-400',
  pendiente_pago: 'bg-amber-500/15 text-amber-400',
  cancelada: 'bg-muted text-muted-foreground line-through',
}
