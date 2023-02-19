export {}

// import {
//   atom,
//   atomFamily,
//   selector,
//   selectorFamily,
//   DefaultValue,
//   useRecoilState,
//   useRecoilValue
// } from "recoil";
// import { syncEffect } from "recoil-sync";
// import { number } from "@recoiljs/refine";
// import { GenderEnum, ListMember } from "./types";
// import { createRange } from "./utilities/createRange";
// import { ListItem, Tally } from "./types";
// import { dHondt, getNumSeats } from "./lib/worksCouncils";
// // import { pluck } from "./utilities/pluck";

// const defaultLists = {
//   id: "S",
//   name: "Brolidarity",
//   members: createRange(3, (index) => ({
//     id: `B.${index + 1}`,
//     gender: GenderEnum.man,
//   })) as ListMember[],
//   votes: 0,
// };

// const listsAtom = atomFamily<ListItem, string>({
//   key: "lists",
//   default: selectorFamily({
//     key: "lists/Default",
//     get:
//       (param) =>
//       ({ get }) => {
//         return defaultLists;
//       },
//   }),
// });

// export const listIds = atom<string[]>({
//   key: "listIds",
//   default: [],
// });

// export const lists = selectorFamily<ListItem, string>({
//   key: "lists",
//   get:
//     (id: string) =>
//     ({ get }) =>
//       get(listsAtom(id)),
//   set:
//     (id: string) =>
//     ({ set }, list) => {
//       if (list instanceof DefaultValue) {
//         return false;
//       }
//       set(listsAtom(id), list);
//       set(listIds, (prev) => [...prev, list.id]);
//     },
// });

// export const listsByVotes = selector<string[]>({
//   key: "listsByVote",
//   get: ({ get }) => {
//     const listIdentifiers = get(listIds);
//     return listIdentifiers.sort((id, otherId) => {
//       return get(lists(otherId)).votes - get(lists(id)).votes;
//     });
//   },
// });

// const numAtom = (key: string) =>
//   atom<number>({
//     key,
//     default: 0,
//     effects: [syncEffect({ refine: number() })],
//   });

// export const numWomenEmployees = numAtom("numWomen");

// export const numMenEmployees = numAtom("numMen");
// export const numNonBinaryEmployees = numAtom("numNonBinary");

// export const totalEmployees = selector({
//   key: "totalEmployees",
//   get: ({ get }) => {
//     const numWomen = get(numWomenEmployees);
//     const numMen = get(numMenEmployees);
//     const numNonBinary = get(numNonBinaryEmployees);
//     return numWomen + numMen + numNonBinary;
//   },
// });

// export const worksCouncilSize = selector({
//   key: "worksCouncilSize",
//   get: ({ get }) => getNumSeats(get(totalEmployees)),
// });

// export const minorityGender = selector<string | undefined>({
//   key: "minorityGender",
//   get: ({ get }) => {
//     const size = get(worksCouncilSize);
//     // minorityGender is only factored in if
//     // the works council has more than 3 seats
//     if (size <= 3) {
//       return undefined;
//     }
//     // const listItems = get(listIds);
//     const numWomen = get(numWomenEmployees);
//     const numMen = get(numMenEmployees);
//     if (numWomen > numMen) {
//       return GenderEnum.man;
//     } else if (numWomen > 0) {
//       return GenderEnum.woman;
//     }
//     return undefined;
//   },
// });

// export const numCandidates = selector({
//   key: "numCandidates",
//   get: ({ get }) => {
//     return get(listIds).reduce((count, id) => {
//       count += get(lists(id)).members.length;
//       return count;
//     }, 0);
//   },
// });

// export const voteData = selector({
//   key: "voteData",
//   get: ({ get }) => {
//     const tally = {} as Tally;
//     let count = 0;
//     get(listIds).forEach((id) => {
//       const votes = get(lists(id)).votes;
//       tally[id] = votes;
//       count += votes;
//     });
//     return { tally, count };
//   },
// });

// export const seatDistributionAtom = selector({
//   key: "seatDistribution",
//   get: ({ get }) => dHondt(get(voteData).tally, get(worksCouncilSize)),
// });



// function Example() {
//   const seatDistribution = useRecoilValue(seatDistributionAtom)

//   return <div>{seatDistribution.man}</div>
// }

