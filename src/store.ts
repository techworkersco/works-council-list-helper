import { create } from "zustand";
import { immer } from "zustand/middleware/immer";

enum Genders {
  man = "man",
  woman = "woman",
  divers = "divers",
}

interface List {
  id: string;
  name: string;
  members: ListMember[];
}

interface ListMember {
  gender: Genders;
}

type State = {
  lists: List[];
};

type Actions = {
  changeListPosition: (listIndex: number, position: number) => void;
  addList: (name?: string) => void;
  addListItem: (listIndex: number, gender?: Genders) => void;
  changeListItemPosition: (
    listIndex: number,
    itemIndex: number,
    position: number
  ) => void;
  removeListItem: (listIndex: number, itemIndex: number) => void;
};

export const useListStore = create(
  immer<State & Actions>((set) => ({
    lists: [
      {
        id: "82471c5f-4207-4b1d-abcb-b98547e01a3e",
        name: "Example List",
        members: [
          {
            gender: Genders.man,
          },
          {
            gender: Genders.woman,
          },
        ],
      },
    ],
    changeListPosition: (listIndex: number, newIndex: number) =>
      set((state) => {
        state.lists!.splice(listIndex, newIndex);
      }),

    addList: (name: string = "Example List 2") => {
      set((state) => {
        state.lists.push({
          id: crypto.randomUUID(),
          name,
          members: [],
        });
      });
    },
    changeListName: (listIndex: number, name: string) => {
      set((state) => {
        state.lists[listIndex].name = name;
      });
    },
    addListItem: (listIndex: number, gender?: Genders) =>
      set((state) => {
        state.lists[listIndex].members.push({
          gender: gender ?? Genders.woman,
        });
      }),
    changeListItemPosition: (
      listIndex: number,
      itemIndex: number,
      newIndex: number
    ) =>
      set((state) => {
        state.lists[listIndex].members.splice(itemIndex, newIndex);
      }),
    removeListItem: (listIndex: number, itemIndex: number) =>
      set((state) => {
        delete state.lists[listIndex].members[itemIndex];
      }),
  }))
);
