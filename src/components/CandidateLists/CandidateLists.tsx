import React, { useCallback, useEffect, useRef, useState } from "react";
import { createPortal, unstable_batchedUpdates } from "react-dom";
import {
  CancelDrop,
  closestCenter,
  pointerWithin,
  rectIntersection,
  CollisionDetection,
  DndContext,
  DragOverlay,
  DropAnimation,
  getFirstCollision,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  Modifiers,
  UniqueIdentifier,
  useSensors,
  useSensor,
  MeasuringStrategy,
  KeyboardCoordinateGetter,
  defaultDropAnimationSideEffects,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  SortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { coordinateGetter as multipleContainersCoordinateGetter } from "../multipleContainerKeyboardCoordinates";

import { Item, Container, Button } from "..";

import { getColor } from "../../utilities/getColor";

import { ItemContent } from "../SortableItem/SortableItem";

import { ListItem, ListMember, Items, GenderEnum, ListData } from "../../types";
import useSessionStorageState from "use-session-storage-state";
import { DroppableContainer } from "../DroppableContainer";
import { CandidateList } from "./CandidateList";
import { demoData } from "../../demoData";

const dropAnimation: DropAnimation = {
  sideEffects: defaultDropAnimationSideEffects({
    styles: {
      active: {
        opacity: "0.5",
      },
    },
  }),
};

interface Props {
  adjustScale?: boolean;
  cancelDrop?: CancelDrop;
  columns?: number;
  listStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  data: { totalWorkers: number };
  listData: ListData;
  minorityGender?: GenderEnum;
  wrapperStyle?(args: { index: number }): React.CSSProperties;
  itemCount?: number;
  items?: Items;
  handle?: boolean;
  renderItem?: any;
  strategy?: SortingStrategy;
  modifiers?: Modifiers;
  minimal?: boolean;
  scrollable?: boolean;
  vertical?: boolean;
  onChange?: (lists: Items) => void;
  onRemoveColumn?: (columnId: UniqueIdentifier) => void;
}

const PLACEHOLDER_ID = "placeholder";
const empty: ListMember[] = [];

export function CandidateLists({
  adjustScale = false,
  cancelDrop,
  columns,
  handle = false,
  items: initialItems,
  minorityGender,
  data: globalData,
  listData,
  coordinateGetter = multipleContainersCoordinateGetter,
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  vertical = false,
  scrollable,
  onChange,
  onRemoveColumn,
}: Props) {
  // TODO: use zustand instead of use state below.
  // const { lists } = useListStore();
  const [items, setItems] = useSessionStorageState<Items>("items", {
    defaultValue: demoData
  });
  const [lists, setContainers] = useSessionStorageState("listOrder", {
    defaultValue: Object.keys(items) as UniqueIdentifier[],
  });
  const [newList, setNewList] = useState<undefined | string>();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isNewList, setIsNewList] = useState<undefined | true>();
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const newListId = useRef<HTMLInputElement>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? lists.includes(activeId) : false;

  /**
   * Custom collision detection strategy optimized for multiple lists
   *
   * - First, find any droppable lists intersecting with the pointer.
   * - If there are none, find intersecting lists with the active draggable.
   * - If there are no intersecting lists, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (list) => list.id in items
          ),
        });
      }

      // Start by finding any intersecting droppable
      const pointerIntersections = pointerWithin(args);
      const intersections =
        pointerIntersections.length > 0
          ? // If there are droppables intersecting with the pointer, return those
            pointerIntersections
          : rectIntersection(args);
      let overId = getFirstCollision(intersections, "id");

      if (overId != null) {
        if (overId in items) {
          const listItems = items[overId];

          // If a list is matched and it contains items (columns 'A', 'B', 'C')
          if (listItems.members.length > 0) {
            // Return the closest droppable within that list
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (list) =>
                  list.id !== overId &&
                  listItems.members.some((member) => member.id === list.id)
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new list, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new list, otherwise
      // the previous `overId` will be returned which can cause items to incorrectly shift positions
      if (recentlyMovedToNewContainer.current) {
        lastOverId.current = activeId;
      }

      // If no droppable is matched, return the last match
      return lastOverId.current ? [{ id: lastOverId.current }] : [];
    },
    [activeId, items]
  );
  const [clonedItems, setClonedItems] = useState<Items | null>(null);
  const sensors = useSensors(
    useSensor(MouseSensor),
    useSensor(TouchSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter,
    })
  );
  const findContainer = (id: UniqueIdentifier) => {
    if (id in items) {
      return id;
    }

    return Object.keys(items).find((key) =>
      items[key].members.some((member) => member.id === id)
    );
  };

  const getIndex = (id: UniqueIdentifier, coll: ListItem) => {
    const list = findContainer(id);

    if (!list) {
      return -1;
    }

    const index = coll.members.findIndex((member) => member.id === id);

    return index;
  };

  const getMemberIndex = (id: UniqueIdentifier) => {
    const list = findContainer(id);

    if (!list) {
      return -1;
    }

    return getIndex(id, items[list]);
  };

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across lists
      setItems(clonedItems);
    }

    setActiveId(null);
    setClonedItems(null);
  };

  useEffect(() => {
    onChange && onChange(items);
  }, [items, onChange]);

  useEffect(() => {
    requestAnimationFrame(() => {
      recentlyMovedToNewContainer.current = false;
    });
  }, [items]);

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={collisionDetectionStrategy}
      measuring={{
        droppable: {
          strategy: MeasuringStrategy.Always,
        },
      }}
      onDragStart={({ active }) => {
        setActiveId(active.id);
        setClonedItems(items);
      }}
      onDragOver={({ active, over }) => {
        const overId = over?.id;

        if (overId == null || active.id in items) {
          return;
        }

        const overContainer = findContainer(overId);
        const activeContainer = findContainer(active.id);

        if (!overContainer || !activeContainer) {
          return;
        }

        if (activeContainer !== overContainer) {
          setItems((items) => {
            const activeItems = items[activeContainer];
            const overItems = items[overContainer];
            const overIndex = getIndex(overId, overItems);
            const activeIndex = getIndex(active.id, activeItems);

            let newIndex: number;

            if (overId in items) {
              newIndex = overItems.members.length + 1;
            } else {
              const isBelowOverItem =
                over &&
                active.rect.current.translated &&
                active.rect.current.translated.top >
                  over.rect.top + over.rect.height;

              const modifier = isBelowOverItem ? 1 : 0;

              newIndex =
                overIndex >= 0
                  ? overIndex + modifier
                  : overItems.members.length + 1;
            }

            recentlyMovedToNewContainer.current = true;

            return {
              ...items,
              [activeContainer]: {
                ...items[activeContainer],
                members: items[activeContainer].members.filter(
                  (item) => item.id !== active.id
                ),
              },
              [overContainer]: {
                ...items[overContainer],
                members: [
                  ...items[overContainer].members.slice(0, newIndex),
                  items[activeContainer].members[activeIndex],
                  ...items[overContainer].members.slice(
                    newIndex,
                    items[overContainer].members.length
                  ),
                ],
              },
            };
          });
        }
      }}
      onDragEnd={({ active, over }) => {
        if (active.id in items && over?.id) {
          setContainers((lists) => {
            const activeIndex = lists.indexOf(active.id);
            const overIndex = lists.indexOf(over.id);

            return arrayMove(lists, activeIndex, overIndex);
          });
        }

        const activeContainer = findContainer(active.id);

        if (!activeContainer) {
          setActiveId(null);
          return;
        }

        const overId = over?.id;

        if (overId == null) {
          setActiveId(null);
          return;
        }

        if (overId === PLACEHOLDER_ID) {
          const newContainerId = getNextContainerId();

          unstable_batchedUpdates(() => {
            setContainers((lists) => [...lists, newContainerId]);
            setItems((items) => ({
              ...items,
              [activeContainer]: {
                ...items[activeContainer],
                members: items[activeContainer].members.filter(
                  (item) => item.id !== activeId
                ),
              },
              [newContainerId]: {
                name: `List ${active.id}`,
                members: [{ id: active.id, gender: GenderEnum.woman }],
                votes: 0,
              },
            }));
            setActiveId(null);
          });
          return;
        }

        const overContainer = findContainer(overId);

        if (overContainer) {
          const activeIndex = getIndex(active.id, items[activeContainer]);
          const overIndex = getIndex(overId, items[overContainer]);

          if (activeIndex !== overIndex) {
            setItems((items) => ({
              ...items,
              [overContainer]: {
                ...items[overContainer],
                members: arrayMove(
                  items[overContainer].members,
                  activeIndex,
                  overIndex
                ),
              },
            }));
          }
        }

        setActiveId(null);
      }}
      cancelDrop={cancelDrop}
      onDragCancel={onDragCancel}
      modifiers={modifiers}
    >
      <div
        style={{
          display: "inline-grid",
          boxSizing: "border-box",
          gridAutoFlow: vertical ? "row" : "column",
        }}
      >
        <SortableContext
          items={[...lists, PLACEHOLDER_ID]}
          strategy={
            vertical
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          {lists.map((listId) => {
            return (
              <CandidateList
                key={listId}
                listId={listId}
                list={items[listId]}
                scrollable={scrollable}
                columns={columns}
                minorityGender={minorityGender}
                totalWorkers={globalData.totalWorkers}
                setItems={setItems}
                handleAddItem={handleAddItem}
                handleRemoveColumn={handleRemoveColumn}
                handleRemoveItem={handleRemoveItem}
                handleRenameList={handleRenameList}
                listData={listData[listId]}
                getMemberIndex={getMemberIndex}
                wrapperStyle={wrapperStyle}
                strategy={strategy}
              />
            );
          })}
          {minimal ? undefined : (
            <div>
              {isNewList ? (
                <form>
                  <div className="input-control">
                    <input
                      id={`edit-list-name-${activeId}`}
                      ref={newListId}
                      type="text"
                      minLength={3}
                      placeholder="List name"
                      aria-label="New List name input"
                      security=""
                      tabIndex={0}
                      autoFocus
                      onChange={(e) => setNewList(e.target.value)}
                    />
                  </div>
                  <div className="input-control">
                    <Button
                      disabled={Boolean(!newList || !newList?.length)}
                      tabIndex={0}
                      aria-label="Create the new list"
                      onClick={() => {
                        if (newList) {
                          setNewList(undefined);
                          handleAddColumn(newList);
                          setIsNewList(undefined);
                        }
                      }}
                    >
                      Create
                    </Button>
                    <Button
                      aria-label="Cancel creating a new list"
                      onClick={() => {
                        setNewList(undefined);
                        setIsNewList(undefined);
                      }}
                      style={{ backgroundColor: "darkgrey" }}
                    >
                      Cancel
                    </Button>
                  </div>
                </form>
              ) : (
                <DroppableContainer
                  id={PLACEHOLDER_ID}
                  disabled={isSortingContainer}
                  items={empty}
                  onClick={() => {
                    setIsNewList(true);
                  }}
                  placeholder
                >
                  + Add list
                </DroppableContainer>
              )}
            </div>
          )}
        </SortableContext>
      </div>

      {createPortal(
        <DragOverlay adjustScale={adjustScale} dropAnimation={dropAnimation}>
          {activeId
            ? lists.includes(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );

  function renderSortableItemDragOverlay(activeId: UniqueIdentifier) {
    const list = findContainer(activeId);
    if (list) {
      const member = items[list].members.find(
        (member) => member.id === activeId
      );
      if (member) {
        return (
          <Item
            value={<ItemContent member={member} />}
            handle={handle}
            color={getColor(member)}
            wrapperStyle={wrapperStyle({ index: 0 })}
            renderItem={renderItem}
            dragOverlay
          />
        );
      }
    }
  }

  function renderContainerDragOverlay(listId: UniqueIdentifier) {
    return (
      <Container
        label={items[listId].name}
        columns={columns}
        style={{
          height: "100%",
        }}
        shadow
        unstyled={false}
        onToggleEdit={() => null}
      >
        {items[listId].members.map((member, index) => (
          <Item
            key={member.id}
            value={<ItemContent member={member} />}
            handle={handle}
            color={getColor(member)}
            wrapperStyle={wrapperStyle({ index })}
            renderItem={renderItem}
          />
        ))}
      </Container>
    );
  }

  function handleRemoveColumn(listID: UniqueIdentifier) {
    setContainers((lists) => lists.filter((id) => id !== listID));
    setItems((items) => {
      delete items[listID];
      return items;
    });
    onRemoveColumn && onRemoveColumn(listID);
    onChange && onChange(items);
  }

  function handleRenameList(listID: UniqueIdentifier, name: string) {
    setItems((items) => ({
      ...items,
      [listID]: {
        ...items[listID],
        name,
      },
    }));
  }

  function handleRemoveItem(index: number, listID: UniqueIdentifier) {
    items[listID].members.splice(index, 1);
    setItems((items) => ({
      ...items,
      [listID]: items[listID],
    }));
  }

  function handleAddItem(listId: UniqueIdentifier) {
    setItems((items) => {
      items[listId].members.push({
        id: `${listId}.${items[listId].members.length + 1}`,
        gender: GenderEnum.woman,
      });
      return {
        ...items,
        [listId]: {
          ...items[listId],
          members: items[listId].members,
        },
      };
    });
  }
  function getRandomizedId(id: string): string {
    const newId = id + Math.round(Math.random() * 10).toString();
    if (!lists.includes(newId)) {
      return newId;
    }
    return getRandomizedId(newId);
  }

  function getNewId(name: string) {
    let newContainerId = name
      .match(/\b([A-Za-z0-9]){2}/g)!
      .join("")
      .toUpperCase();
    if (!lists.includes(newContainerId)) {
      return newContainerId;
    }
    return getRandomizedId(newContainerId);
  }

  function handleAddColumn(name: string) {
    let newContainerId = getNewId(name);

    if (newList) {
      unstable_batchedUpdates(() => {
        setNewList(undefined);
        setContainers((lists) => [...lists, newContainerId]);

        setItems((items) => ({
          ...items,
          [newContainerId]: { members: [], name, votes: 0 },
        }));
      });
    }
  }

  function getNextContainerId() {
    const listIds = Object.keys(items);
    const lastContainerId = listIds[listIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }
}
