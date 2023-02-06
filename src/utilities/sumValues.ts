import { Tally } from "../types";

export function sumValues(tally: Tally): number {
  return Object.values(tally).reduce((total, data) => {
    return total + data ?? 0;
  }, 0);
}
