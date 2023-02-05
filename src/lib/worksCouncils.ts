import type { Tally } from "../types";

/**
 * Based on the law
 */
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

/**
 * For a given number of employees
 * return the amount of works council seats they should have
 * @param numEmployees
 * @returns {number}
 */
export function getNumSeats(numEmployees: number) {
  for (const limit in employeeThreshholds) {
    if (numEmployees < parseInt(limit)) {
      return employeeThreshholds[limit];
    }
  }
  // if the lookup table doesn't furnish a provided limit
  return Math.ceil((numEmployees - 9000) / 3000) * 2 + 35;
}

/**
 * (Currently unused)
 *
 * @param voterTally
 * @param worksCouncilSize
 * @param workforcePopulation
 * @returns {Record<string, Tally>} (for now?)
 */
export function idealGenderQuota(
  /**
   * tally of popular votes by list - { lista: 12, listb: 2 }
   */
  voterTally: Tally,
  /**
   * number of works council seats
   */
  worksCouncilSize: number,
  /**
   * tally of workers by gender across the workplace
   */
  workforcePopulation: Tally
) {
  const listResults = dHondt(voterTally, worksCouncilSize);
  return Object.entries(listResults).reduce<Record<string, Tally>>(
    (obj, [listName, numListSeatsAllocated]) => {
      obj[listName] = dHondt(workforcePopulation, numListSeatsAllocated);
      return obj;
    },
    {}
  );
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
    for (const [segment, count] of Object.entries(workforcePopulation)) {
      if (count > 0) {
        dHondt_arrs.push([segment, count / i]);
      }
    }
  }
  return dHondt_arrs
    .sort((a, b) => b[1] - a[1])
    .slice(0, seats)
    .reduce<Tally>((obj, [segment]) => {
      if (!obj[segment]) {
        obj[segment] = 0;
      }
      obj[segment]++;
      return obj;
    }, {});
}
