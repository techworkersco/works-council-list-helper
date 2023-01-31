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

  
//   function dHondt (lists, seats){

//     let dHondt_arrs = []
//     for (let i = 0; i < seats; i++) {
//       for (const [k, v] of Object.entries(lists)) { dHondt_arrs.push([k, v / i]) }
//     }
//     return dHondt_arrs .sort((a, b) => b[1]-a[1]).slice(0, seats).reduce((obj, [k]) => {
//       if (!obj[k]) {
//       obj[k] = 0
//       }
//       obj[k] ++;
//       return obj
//       }, {})
//    }