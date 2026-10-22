export const dateTime = value => value
  ? new Date(value.includes('T') ? value : `${value.replace(' ', 'T')}Z`).toLocaleString('es-CR', { dateStyle: 'medium', timeStyle: 'short' })
  : '—';
