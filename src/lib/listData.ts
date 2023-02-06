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
  minorityGender?: GenderEnum
): ListDataItem {
  const popularListGenderTally: Record<GenderEnum, number> = list.members
    .filter((m) => m.elected)
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

  const listDistribution = seatDistribution && seatDistribution[listId];
  const listGenderRatio =
    binaryWorkplaceGenderTally &&
    listDistribution &&
    dHondt(binaryWorkplaceGenderTally, listDistribution);

  let isGenderRatioValid = null;

  if (listGenderRatio && minorityGender) {
    isGenderRatioValid = Boolean(
      popularListGenderTally[minorityGender] >=
        listGenderRatio[minorityGender]
    );
  }
  return {
    popularListGenderTally,
    listDistribution,
    listGenderRatio,
    isGenderRatioValid,
  };
}

export function tallyAndValidateLists(
  lists: Items,
  binaryWorkplaceGenderTally: Tally,
  seatDistribution: Tally,
  minorityGender?: GenderEnum
): ListData {
  return Object.entries(lists).reduce((listData, [listId, list]) => {
    listData[listId] = tallyAndValidateList(
      list,
      listId,
      binaryWorkplaceGenderTally,
      seatDistribution,
      minorityGender
    );
    return listData;
  }, {} as ListData);
}
