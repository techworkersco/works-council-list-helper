import type { UniqueIdentifier } from "@dnd-kit/core";
export type Tally = Record<string, number>;

export enum Gender {
  man = "man",
  woman = "woman",
  nonbinary = "nonbinary",
}

export enum GenderPlurals {
  man = "Men",
  woman = "Women",
  nonbinary = "NonBinary",
}

export const genderArray = [Gender.man, Gender.woman, Gender.nonbinary];

export type ListMember = {
  id: UniqueIdentifier;
  gender: Gender;
  elected?: boolean;
};

export type ListItem = {
  name: string;
  members: ListMember[];
  votes: number;
};

export type Items = Record<UniqueIdentifier, ListItem>;
