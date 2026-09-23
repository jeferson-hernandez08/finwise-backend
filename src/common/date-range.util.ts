/**
 * Rangos de fecha de un periodo.
 *
 * Las fechas llegan del frontend como `YYYY-MM-DD` y Mongoose las guarda a
 * medianoche UTC, asi que los limites tambien se construyen en UTC. Usando
 * hora local el dia 1 de cada mes caeria en el mes anterior (en Colombia,
 * UTC-5) y los totales del listado y del dashboard no cuadrarian.
 */
export interface DateRange {
  start: Date;
  end: Date;
}

/** Primer y ultimo instante del mes indicado (month: 1-12). */
export function monthRange(year: number, month: number): DateRange {
  return {
    start: new Date(Date.UTC(year, month - 1, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, month, 0, 23, 59, 59, 999)),
  };
}

/** Primer y ultimo instante del año indicado. */
export function yearRange(year: number): DateRange {
  return {
    start: new Date(Date.UTC(year, 0, 1, 0, 0, 0, 0)),
    end: new Date(Date.UTC(year, 11, 31, 23, 59, 59, 999)),
  };
}

/** Resta `count - 1` meses al periodo dado y devuelve la lista cronologica. */
export function lastMonths(
  year: number,
  month: number,
  count: number,
): { year: number; month: number }[] {
  const months: { year: number; month: number }[] = [];
  for (let i = count - 1; i >= 0; i--) {
    const cursor = new Date(Date.UTC(year, month - 1 - i, 1));
    months.push({
      year: cursor.getUTCFullYear(),
      month: cursor.getUTCMonth() + 1,
    });
  }
  return months;
}
