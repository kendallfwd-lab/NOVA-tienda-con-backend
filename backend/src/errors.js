export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export function fail(status, message) {
  throw new AppError(status, message);
}

export function requireObject(value) {
  if (!value || typeof value !== 'object' || Array.isArray(value)) fail(400, 'Se requiere un objeto JSON válido.');
  return value;
}

export function positiveId(value, label = 'ID') {
  const id = Number(value);
  if (!Number.isSafeInteger(id) || id <= 0) fail(400, `${label} debe ser un entero positivo.`);
  return id;
}

export function nonEmpty(value, label, min = 1) {
  if (typeof value !== 'string' || value.trim().length < min) fail(400, `${label} requiere al menos ${min} caracteres.`);
  return value.trim();
}

export function integer(value, label, min = 0) {
  if (!Number.isSafeInteger(value) || value < min) fail(400, `${label} debe ser un entero igual o mayor que ${min}.`);
  return value;
}

export function presentOr(value, fallback) {
  return value === undefined ? fallback : value;
}

export function transaction(db, work) {
  db.exec('BEGIN IMMEDIATE');
  try {
    const result = work();
    db.exec('COMMIT');
    return result;
  } catch (error) {
    db.exec('ROLLBACK');
    throw error;
  }
}

