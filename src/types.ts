import type { UniqueIdentifier } from "@dnd-kit/core";
export type Tally = Record<string, number>;

export enum GenderEnum {
  man = "Men",
  woman = "Women",
  nonbinary = "NonBinary",
}

export const genderArray = [
  GenderEnum.man,
  GenderEnum.woman,
  GenderEnum.nonbinary,
];

export const SingularGenders = {
    [GenderEnum.man]: "Man",
    [GenderEnum.woman]: "Woman",
    [GenderEnum.nonbinary]: "Non-Binary",
}

export type ListMember = {
  id: UniqueIdentifier;
  gender: GenderEnum;
  isPopularlyElected?: boolean;
};

export type ListItem = {
  name: string;
  members: ListMember[];
  votes: number;
};

export type ListDataItem = {
  popularListGenderTally: Record<GenderEnum, number>;
  popularListDistribution: number;
  listGenderRatio: Tally | 0;
  isGenderRatioValid: boolean | null;
  popularlyElectedMembers: number[];
  overflowElectedMembers: number[];
  genderOverflowElectedMembers: number[];
  minorityGenderElectedMembers: number[];
  overflowDistribution: number;
  genderDistribution: number;
};

export type Tdata = {
  numWomen: number;
  numMen: number;
  numNonBinary: number;
  totalWorkers: number;
  worksCouncilSize: number;
  minorityGender: GenderEnum;
  workplaceGenderQuota: Record<GenderEnum, number>;
  isGenderQuotaAchieved: boolean;
  moreVotesThanWorkers: boolean;
  notEnoughSeats: boolean;
  suggestMoreSeats: boolean;
  totalCandidates: number;
  suggestedSeats: number;
  totalVotes: number;
};

export type Tactions = {
  setNumWomen: (num: number) => void;
  setNumMen: (num: number) => void;
  setNumNonBinary: (num: number) => void;
};

export type ListData = {
  [id: string]: ListDataItem;
};

export type Items = Record<UniqueIdentifier, ListItem>;
