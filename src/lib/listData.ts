import {
  Items,
  GenderEnum,
  Tally,
  ListData,
  ListItem,
  ListDataItem,
} from "../types";

import { dHondt } from "./worksCouncils";

/**
 * tally & distribute the outcomes on per-list, and validate for
 * works constitution act legislated gender quota distribution
 */
function tallyAndValidateList(
  list: ListItem,
  listId: string,
  binaryWorkplaceGenderTally: Tally,
  seatDistribution: Tally,
  overflowDistribution: number,
  genderDistribution: number,
  minorityGender?: GenderEnum
): ListDataItem {
  let popularListDistribution = seatDistribution && seatDistribution[listId];
  const listGenderRatio =
    binaryWorkplaceGenderTally &&
    popularListDistribution &&
    dHondt(binaryWorkplaceGenderTally, popularListDistribution);

  let isGenderRatioValid = null;

  let popularlyElectedMembers: number[] = [];
  let minorityGenderElectedMembers: number[] = [];
  let overflowElectedMembers: number[] = [];
  let genderOverflowElectedMembers: number[] = [];

  if (popularListDistribution > list.members.length) {
    overflowDistribution += popularListDistribution - list.members.length;
  }

  list.members.forEach((member, i) => {
    if (i < popularListDistribution) {
      popularlyElectedMembers.push(i);
      if (member.gender === minorityGender) {
        minorityGenderElectedMembers.push(i);
      }
    } else {
      // a list must have at least one vote for re-distribution, or is there more nuance her?
      if(list.votes > 0 ) {
         // if there are overflow votes from other lists to distribute
        if(overflowDistribution > 0) {
          overflowElectedMembers.push(i);
          if (member.gender === minorityGender) {
            minorityGenderElectedMembers.push(i);
          }
          overflowDistribution = overflowDistribution - 1;
        }
        // or gender quota seats to distribute
        if (genderDistribution > 0) {
          if (member.gender === minorityGender) {
            genderOverflowElectedMembers.push(i);
            minorityGenderElectedMembers.push(i);
            genderDistribution -= 1;
          }
        }
      }
    
    }
  });

  const popularListGenderTally: Record<GenderEnum, number> = list.members
    .filter((m, i) => popularlyElectedMembers.includes(i))
    .reduce(
      (tally, member) => {
        if (tally[member.gender] === undefined) {
          tally[member.gender] = 0;
        }
        tally[member.gender]++;
        return tally;
      },
      {
        [GenderEnum.man]: 0,
        [GenderEnum.woman]: 0,
        [GenderEnum.nonbinary]: 0,
      } as Record<GenderEnum, number>
    );

  if (listGenderRatio && minorityGender) {
    const minorityProportion = listGenderRatio[minorityGender] ?? 0;
    isGenderRatioValid = Boolean(
      popularListGenderTally[minorityGender] >= minorityProportion
    );


    if (!isGenderRatioValid) {
      const genderOverflow =
      minorityProportion - popularListGenderTally[minorityGender];
      console.log({ genderOverflow })

      popularlyElectedMembers.slice(0, -genderOverflow);
      popularlyElectedMembers.splice(popularlyElectedMembers.length - genderOverflow,
        genderOverflow);
      popularListDistribution -= genderOverflow;

      genderDistribution += genderOverflow;
      console.log(genderDistribution);
    }

  }

  return {
    popularListGenderTally,
    popularListDistribution,
    listGenderRatio,
    isGenderRatioValid,
    popularlyElectedMembers,
    minorityGenderElectedMembers,
    overflowElectedMembers,
    overflowDistribution,
    genderOverflowElectedMembers,
    genderDistribution
  };
}

/**
 * Compute the overall outcomes for the election, passing along seat distribution
 * information as
 */
export function tallyAndValidateLists(
  lists: Items,
  binaryWorkplaceGenderTally: Tally,
  seatDistribution: Tally,
  minorityGender?: GenderEnum
): ListData {
  let overflowDistribution = 0;
  let genderDistribution = 0;
  return (
    Object.entries(lists)
      // because of overflowDistribution for finding "overflow"
      // seats, and gender-equity-based seat distribution,
      // we need to sort the lists by number of votes
      .sort(([, list], [, listA]) => listA.votes - list.votes)
      .reduce((listData, [listId, list]) => {
        listData[listId] = tallyAndValidateList(
          list,
          listId,
          binaryWorkplaceGenderTally,
          seatDistribution,
          overflowDistribution,
          genderDistribution,
          minorityGender
        );
        overflowDistribution = listData[listId].overflowDistribution;
        genderDistribution = listData[listId].genderDistribution;
        return listData;
      }, {} as ListData)
  );
}
