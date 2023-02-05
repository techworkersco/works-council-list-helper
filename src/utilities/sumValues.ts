import { Tally } from "../types";

export function sumValues(tally: Tally, prop?: string): number {
  return Object.values(tally).reduce((total, data) => {
    return total + data ?? 0;
  }, 0);
}

export function sumValuesByProp(
  tally: Record<string, unknown>,
  prop: string
): number {
  // @ts-expect-error
  return Object.values(tally).reduce((total, data) => {
    // @ts-expect-error

    return total + (data[prop] ?? 0);
  }, 0);
}
