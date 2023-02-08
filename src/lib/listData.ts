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
  leftoverDistribution: number,
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
    leftoverDistribution += listDistribution - list.members.length;
  }

  list.members.forEach((member, i) => {
    if (i < listDistribution) {
      popularlyElectedMembers.push(i);
      if (member.gender === minorityGender) {
        minorityGenderElectedMembers.push(i);
      }
    } else {
      if (leftoverDistribution > 0) {
        overflowElectedMembers.push(i);
        if (member.gender === minorityGender) {
          minorityGenderElectedMembers.push(i);
        }
        leftoverDistribution = leftoverDistribution - 1;
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
    leftoverDistribution,
  };
}

export function tallyAndValidateLists(
  lists: Items,
  binaryWorkplaceGenderTally: Tally,
  seatDistribution: Tally,
  minorityGender?: GenderEnum
): ListData {
  let leftoverDistribution = 0;
  return Object.entries(lists)
    .sort(([, list], [, listA]) => listA.votes - list.votes)
    .reduce((listData, [listId, list]) => {
      listData[listId] = tallyAndValidateList(
        list,
        listId,
        binaryWorkplaceGenderTally,
        seatDistribution,
        leftoverDistribution,
        minorityGender
      );
      leftoverDistribution = listData[listId].leftoverDistribution;
      return listData;
    }, {} as ListData);
}
