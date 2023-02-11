import {
  Items,
  GenderEnum,
  Tally,
  ListData,
  ListItem,
  ListDataItem,
} from "../types";

import { dHondt } from "./worksCouncils";

function tallyAndValidateList(
  list: ListItem,
  listId: string,
  binaryWorkplaceGenderTally: Tally,
  seatDistribution: Tally,
  overflowDistribution: number,
  minorityGender?: GenderEnum
): ListDataItem {
  const listDistribution = seatDistribution && seatDistribution[listId];
  const listGenderRatio =
    binaryWorkplaceGenderTally &&
    listDistribution &&
    dHondt(binaryWorkplaceGenderTally, listDistribution);

  let isGenderRatioValid = null;

  let popularlyElectedMembers: number[] = [];
  let minorityGenderElectedMembers: number[] = [];
  let overflowElectedMembers: number[] = [];

  if (listDistribution > list.members.length) {
    overflowDistribution += listDistribution - list.members.length;
  }

  list.members.forEach((member, i) => {
    if (i < listDistribution) {
      popularlyElectedMembers.push(i);
      if (member.gender === minorityGender) {
        minorityGenderElectedMembers.push(i);
      }
    } else {
      // if there are overflow votes from other lists to distribute,
      // and this list has at least one vote
      if (overflowDistribution > 0 && list.votes > 0) {
        overflowElectedMembers.push(i);
        if (member.gender === minorityGender) {
          minorityGenderElectedMembers.push(i);
        }
        overflowDistribution = overflowDistribution - 1;
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
    isGenderRatioValid = Boolean(
      popularListGenderTally[minorityGender] >= listGenderRatio[minorityGender]
    );
  }
  return {
    popularListGenderTally,
    listDistribution,
    listGenderRatio,
    isGenderRatioValid,
    popularlyElectedMembers,
    minorityGenderElectedMembers,
    overflowElectedMembers,
    overflowDistribution,
  };
}

export function tallyAndValidateLists(
  lists: Items,
  binaryWorkplaceGenderTally: Tally,
  seatDistribution: Tally,
  minorityGender?: GenderEnum
): ListData {
  let overflowDistribution = 0;
  return (
    Object.entries(lists)
      // because of overflowDistribution for finding "overflow"
      // seats, we need to sort the lists by number of votes descending
      .sort(([, list], [, listA]) => listA.votes - list.votes)
      .reduce((listData, [listId, list]) => {
        listData[listId] = tallyAndValidateList(
          list,
          listId,
          binaryWorkplaceGenderTally,
          seatDistribution,
          overflowDistribution,
          minorityGender
        );
        overflowDistribution = listData[listId].overflowDistribution;
        return listData;
      }, {} as ListData)
  );
}
