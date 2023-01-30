import { UniqueIdentifier } from "@dnd-kit/core";
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
  lists: Record<string, List>;
  listSort: UniqueIdentifier[]
};

type Actions = {
  changeListPosition: (listIndex: UniqueIdentifier, position: number) => void;
  addList: (name?: string) => void;
  addListItem: (listIndex: number, gender?: Genders) => void;
  changeListItemPosition: (
    listId: UniqueIdentifier,
    itemIndex: number,
    position: number
  ) => void;
  removeListItem: (listIndex: number, itemIndex: number) => void;
};

export const useListStore = create(
  immer<State & Actions>((set) => ({
    listSort: ["82471c5f-4207-4b1d-abcb-b98547e01a3e"],
    lists: {
      "82471c5f-4207-4b1d-abcb-b98547e01a3e": {
        id: "82471c5f-4207-4b1d-abcb-b98547e01a3e",
        name: "Example List",
        position: 0,
        members: [
          {
            gender: Genders.man,
          },
          {
            gender: Genders.woman,
          },
        ],
      },
    },
    changeListPosition: (listId: UniqueIdentifier, newIndex: number) =>
      set((state) => {
        state.listSort.splice(newIndex, 1, listId)
      }),

    addList: (name: string = "Example List 2") => set((state) => {
        const newListId = crypto.randomUUID()
        state.lists[newListId] = {
          id: newListId,
          name,
          members: []
        }

      }),
    changeListName: (listIndex: number, name: string) => set((state) => {
        state.lists[listIndex].name = name;
      })
    ,
    addListItem: (listIndex: number, gender?: Genders) =>
      set((state) => {
        state.lists[listIndex].members.push({
          gender: gender ?? Genders.woman,
        });
      }),
    changeListItemPosition: (
      listId,
      itemIndex,
      newIndex
    ) =>
      set((state) => {
        state.lists[listId].members.splice(itemIndex, newIndex);
      }),
    removeListItem: (listIndex: number, itemIndex: number) =>
      set((state) => {
        delete state.lists[listIndex].members[itemIndex];
      }),
  })))
