import type { Tally } from '../types'

export const employeeThreshholds: Record<number, number> = {
  5: 0,
  21: 1,
  51: 3,
  101: 5,
  201: 7,
  401: 9,
  701: 11,
  1001: 13,
  1501: 15,
  2001: 17,
  2501: 19,
  3001: 21,
  3501: 23,
  4001: 25,
  4501: 27,
  5001: 29,
  6001: 31,
  7001: 33,
  9001: 35,
};

export function getNumSeats(numEmployees: number) {
  for (const limit in employeeThreshholds) {
    if (numEmployees < parseInt(limit)) {
      return employeeThreshholds[limit];
    }
  }
  // if the lookup table doesn't furnish a provided limit
  return Math.ceil((numEmployees - 9000) / 3000) * 2 + 35;
}

export function idealGenderQuota(
  voterTally: Tally,
  worksCouncilSize: number,
  workforcePopulation: Tally
) {
  const listResults = dHondt(voterTally, worksCouncilSize);
  Object.entries(listResults).reduce<Tally>((obj, [k, v]) => {
    // @ts-expect-error
    obj[k] = dHondt(workforcePopulation, v);
    return obj;
  }, {});
}
/**
 * Use it to compute ideal ratios for gender equality, and for general list distribution.
 * Refers to https://en.wikipedia.org/wiki/D%27Hondt_method
 * @param tally {Tally} gender distribution, list votes, etc for distribution
 * @param seats {number}
 * @returns {Tally}
 */
export function dHondt(workforcePopulation: Tally, seats: number): Tally {
  let dHondt_arrs: [string, number][] = [];
  for (let i = 0; i < seats; i++) {
    for (const [k, v] of Object.entries(workforcePopulation)) {
      if (v > 0) {
        dHondt_arrs.push([k, v / i]);
      }
    }
  }
  return dHondt_arrs
    .sort((a, b) => b[1] - a[1])
    .slice(0, seats)
    .reduce<Tally>((obj, [k]) => {
      if (!obj[k]) {
        obj[k] = 0;
      }
      obj[k]++;
      return obj;
    }, {});
}
