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
  AnimateLayoutChanges,
  SortableContext,
  useSortable,
  arrayMove,
  defaultAnimateLayoutChanges,
  verticalListSortingStrategy,
  SortingStrategy,
  horizontalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { coordinateGetter as multipleContainersCoordinateGetter } from "../multipleContainerKeyboardCoordinates";

import { Item, Container, ContainerProps, Button } from "..";

import { createRange } from "../../utilities/createRange";
import { getColor } from "../../utilities/getColor";

import { SortableItem, ItemContent } from "../SortableItem/SortableItem";

import styles from "./CandidateLists.module.css";

import {
  ListItem,
  ListMember,
  Items,
  genderArray,
  GenderEnum,
  ListData,
  ListDataItem,
  Tdata,
} from "../../types";
import classNames from "classnames";
import useSessionStorageState from "use-session-storage-state";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  onToggleEdit,
  onRenameList,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: ListMember[];
  style?: React.CSSProperties;
  onToggleEdit?: ContainerProps["onToggleEdit"];
  onRenameList?: (name: string) => void;
}) {
  const {
    active,
    attributes,
    isDragging,
    listeners,
    over,
    setNodeRef,
    transition,
    transform,
  } = useSortable({
    id,
    data: {
      type: "container",
      children: items,
    },
    animateLayoutChanges,
  });
  const [isEditingList, setIsEditingList] = useState<boolean>(false);
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "container") ||
      items.some((item) => item.id === over.id)
    : false;

  if (isEditingList) {
    // @ts-expect-error
    props.label = (
      <ListEditForm
        onChange={onRenameList}
        // @ts-expect-error
        list={{ id, name: props.label, members: [], votes: 0 }}
      />
    );
  }

  return (
    <Container
      ref={disabled ? undefined : setNodeRef}
      style={{
        ...style,
        transition,
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.5 : undefined,
      }}
      hover={isOverContainer}
      handleProps={{
        ...attributes,
        ...listeners,
      }}
      onToggleEdit={() => {
        setIsEditingList(!isEditingList);
      }}
      isEditing={isEditingList}
      columns={columns}
      {...props}
    >
      {children}
    </Container>
  );
}

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
  containerStyle?: React.CSSProperties;
  coordinateGetter?: KeyboardCoordinateGetter;
  data: Tdata;
  listData: ListData;
  minorityGender?: GenderEnum;
  getItemStyles?(args: {
    value: UniqueIdentifier;
    index: number;
    overIndex: number;
    isDragging: boolean;
    containerId: UniqueIdentifier;
    isSorting: boolean;
    isDragOverlay: boolean;
  }): React.CSSProperties;
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

type ListEditFormProps = {
  list: ListItem;
  onChange?: (name: string) => void | undefined;
};

function ListEditForm({ list, onChange }: ListEditFormProps) {
  return (
    <form>
      <input
        type="text"
        tabIndex={0}
        autoFocus
        defaultValue={list.name}
        onChange={(e) => onChange && onChange(e.target.value)}
      />
    </form>
  );
}

type ListVotesFormProps = {
  list: ListItem;
  onChange?: (name: number) => void | undefined;
};

function ListVotesForm({ list, onChange }: ListVotesFormProps) {
  return (
    <div className="input-control">
      <label htmlFor="votes">Votes</label>

      <input
        name="votes"
        type="number"
        min={0}
        defaultValue={list.votes}
        tabIndex={0}
        style={{ width: 60 }}
        onChange={(e) =>
          onChange &&
          e.target.value?.length &&
          onChange(parseInt(e.target.value))
        }
      />
    </div>
  );
}

export function CandidateLists({
  adjustScale = false,
  itemCount = 3,
  cancelDrop,
  columns,
  handle = false,
  items: initialItems,
  containerStyle,
  minorityGender,
  data: globalData,
  listData,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
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
    defaultValue: initialItems ?? {
      S: {
        name: "Brolidarity",
        members: createRange(itemCount, (index) => ({
          id: `B.${index + 1}`,
          gender: GenderEnum.man,
        })),
        votes: 0,
      },
      S1: {
        name: "Solidarity",
        members: createRange(itemCount, (index) => ({
          id: `S.${index + 1}`,
          gender: GenderEnum.woman,
        })),
        votes: 0,
      },
    },
  });
  const [containers, setContainers] = useSessionStorageState("listOrder", {
    defaultValue: Object.keys(items) as UniqueIdentifier[],
  });
  const [newList, setNewList] = useState<undefined | string>();
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const [isNewList, setIsNewList] = useState<undefined | true>();
  const lastOverId = useRef<UniqueIdentifier | null>(null);
  const newListId = useRef<HTMLInputElement>(null);
  const recentlyMovedToNewContainer = useRef(false);
  const isSortingContainer = activeId ? containers.includes(activeId) : false;

  /**
   * Custom collision detection strategy optimized for multiple containers
   *
   * - First, find any droppable containers intersecting with the pointer.
   * - If there are none, find intersecting containers with the active draggable.
   * - If there are no intersecting containers, return the last matched intersection
   *
   */
  const collisionDetectionStrategy: CollisionDetection = useCallback(
    (args) => {
      if (activeId && activeId in items) {
        return closestCenter({
          ...args,
          droppableContainers: args.droppableContainers.filter(
            (container) => container.id in items
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
          const containerItems = items[overId];

          // If a container is matched and it contains items (columns 'A', 'B', 'C')
          if (containerItems.members.length > 0) {
            // Return the closest droppable within that container
            overId = closestCenter({
              ...args,
              droppableContainers: args.droppableContainers.filter(
                (container) =>
                  container.id !== overId &&
                  containerItems.members.some(
                    (member) => member.id === container.id
                  )
              ),
            })[0]?.id;
          }
        }

        lastOverId.current = overId;

        return [{ id: overId }];
      }

      // When a draggable item moves to a new container, the layout may shift
      // and the `overId` may become `null`. We manually set the cached `lastOverId`
      // to the id of the draggable item that was moved to the new container, otherwise
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
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    const index = coll.members.findIndex((member) => member.id === id);

    return index;
  };

  const getMemberIndex = (id: UniqueIdentifier) => {
    const container = findContainer(id);

    if (!container) {
      return -1;
    }

    return getIndex(id, items[container]);
  };

  const onDragCancel = () => {
    if (clonedItems) {
      // Reset items to their original state in case items have been
      // Dragged across containers
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
          setContainers((containers) => {
            const activeIndex = containers.indexOf(active.id);
            const overIndex = containers.indexOf(over.id);

            return arrayMove(containers, activeIndex, overIndex);
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
            setContainers((containers) => [...containers, newContainerId]);
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
          items={[...containers, PLACEHOLDER_ID]}
          strategy={
            vertical
              ? verticalListSortingStrategy
              : horizontalListSortingStrategy
          }
        >
          {containers.map((containerId) => {
            const container = items[containerId];
            let data: ListDataItem | null = null;
            if (listData || listData[containerId]) {
              data = listData[containerId];
            }

            return (
              <DroppableContainer
                key={containerId}
                id={containerId}
                label={minimal ? undefined : container.name}
                columns={columns}
                items={container.members}
                scrollable={scrollable}
                style={containerStyle}
                unstyled={minimal}
                onRemove={() => handleRemoveColumn(containerId)}
                onRenameList={(name) => handleRenameList(containerId, name)}
              >
                <SortableContext items={container.members} strategy={strategy}>
                  {container.members.map((member, index) => {
                    if (
                      data &&
                      data.listDistribution &&
                      index < data.listDistribution
                    ) {
                      member.elected = true;
                    } else {
                      member.elected = false;
                    }
                    return (
                      <SortableItem
                        disabled={isSortingContainer}
                        member={member}
                        index={index}
                        handle={handle}
                        key={member.id}
                        onRemove={() => handleRemoveItem(index, containerId)}
                        style={getItemStyles}
                        wrapperStyle={wrapperStyle}
                        renderItem={renderItem}
                        containerId={containerId}
                        getIndex={getMemberIndex}
                        onChangeItem={(member) =>
                          setItems((items) => {
                            items[containerId].members[index].gender =
                              member.gender;
                            return { ...items };
                          })
                        }
                      />
                    );
                  })}
                  <Container
                    placeholder
                    style={{
                      minWidth: "inherit",
                      width: "100%",
                      minHeight: 100,
                    }}
                    onClick={() => handleAddItem(containerId)}
                  >
                    + Add Member
                  </Container>
                  {container.members.length ? (
                    <div>
                      <div className={classNames("form", styles.ListFooter)}>
                        {minorityGender && (
                          <div className="input-control">
                            <label>Gender Distribution</label>
                            <div
                              className={classNames(styles.ListStats, "cell")}
                            >
                              {genderArray.map((gender) => {
                                return (
                                  <span key={containerId + gender}>
                                    {gender[0].toLocaleLowerCase()}:&nbsp;
                                    {
                                      items[containerId].members.filter(
                                        (m) => m.gender === gender
                                      ).length
                                    }
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        )}

                        {globalData.totalWorkers > 0 && (
                          <ListVotesForm
                            onChange={(value) => {
                              setItems((items) => {
                                items[containerId].votes = value;
                                // just copying the object here is enough to
                                // bind the change
                                return { ...items };
                              });
                            }}
                            list={items[containerId]}
                          />
                        )}
                        {data && data.listDistribution ? (
                          <>
                            <div className="input-control">
                              <label>Seat Distribution (raw)</label>
                              <span className="cell">
                                {data.listDistribution}
                              </span>
                            </div>
                            {/* <div className="input-control">
                              <label>List Size Gender Ratio</label>
                              <span className="cell">
                                {JSON.stringify(
                                  data.listSizeGenderRatio,
                                  null,
                                  2
                                )}
                              </span>
                            </div> */}
                            {minorityGender && (
                              <div className="input-control">
                                <label htmlFor="listGenderQuota">
                                  Gender Quota
                                </label>
                                <span id="listGenderQuota" className="cell">
                                  {data.isGenderRatioValid === true && "valid"}
                                  {data.isGenderRatioValid === false &&
                                    "invalid"}
                                </span>
                              </div>
                            )}
                          </>
                        ) : (
                          ""
                        )}
                      </div>
                    </div>
                  ) : (
                    ""
                  )}
                </SortableContext>
              </DroppableContainer>
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
                      security=""
                      tabIndex={0}
                      autoFocus
                      onChange={(e) => setNewList(e.target.value)}
                    />
                  </div>
                  <div className="input-control">
                    <Button
                      // @ts-ignore
                      disabled={!newList || !newList.length}
                      tabIndex={0}
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
            ? containers.includes(activeId)
              ? renderContainerDragOverlay(activeId)
              : renderSortableItemDragOverlay(activeId)
            : null}
        </DragOverlay>,
        document.body
      )}
    </DndContext>
  );

  function renderSortableItemDragOverlay(activeId: UniqueIdentifier) {
    const container = findContainer(activeId);
    if (container) {
      const member = items[container].members.find(
        (member) => member.id === activeId
      );
      if (member) {
        return (
          <Item
            value={<ItemContent member={member} />}
            handle={handle}
            style={getItemStyles({
              containerId: findContainer(member.id) as UniqueIdentifier,
              overIndex: -1,
              index: getMemberIndex(member.id),
              value: member.id,
              isSorting: true,
              isDragging: true,
              isDragOverlay: true,
            })}
            color={getColor(member)}
            wrapperStyle={wrapperStyle({ index: 0 })}
            renderItem={renderItem}
            dragOverlay
          />
        );
      }
    }
  }

  function renderContainerDragOverlay(containerId: UniqueIdentifier) {
    return (
      <Container
        label={items[containerId].name}
        columns={columns}
        style={{
          height: "100%",
        }}
        shadow
        unstyled={false}
        onToggleEdit={() => null}
      >
        {items[containerId].members.map((member, index) => (
          <Item
            key={member.id}
            value={<ItemContent member={member} />}
            handle={handle}
            style={getItemStyles({
              containerId,
              overIndex: -1,
              index: getMemberIndex(member.id),
              value: member.id,
              isDragging: false,
              isSorting: false,
              isDragOverlay: false,
            })}
            color={getColor(member)}
            wrapperStyle={wrapperStyle({ index })}
            renderItem={renderItem}
          />
        ))}
      </Container>
    );
  }

  function handleRemoveColumn(containerID: UniqueIdentifier) {
    setContainers((containers) =>
      containers.filter((id) => id !== containerID)
    );
    setItems((items) => {
      delete items[containerID];
      return items;
    });
    onRemoveColumn && onRemoveColumn(containerID);
    onChange && onChange(items);
  }

  function handleRenameList(containerID: UniqueIdentifier, name: string) {
    setItems((items) => ({
      ...items,
      [containerID]: {
        ...items[containerID],
        name,
      },
    }));
  }

  function handleRemoveItem(index: number, containerID: UniqueIdentifier) {
    items[containerID].members.splice(index, 1);
    setItems((items) => ({
      ...items,
      [containerID]: items[containerID],
    }));
  }

  function handleAddItem(containerId: UniqueIdentifier) {
    setItems((items) => {
      items[containerId].members.push({
        id: `${containerId}.${items[containerId].members.length + 1}`,
        gender: GenderEnum.woman,
      });
      return {
        ...items,
        [containerId]: {
          ...items[containerId],
          members: items[containerId].members,
        },
      };
    });
  }
  function getRandomizedId(id: string): string {
    const newId = id + Math.round(Math.random() * 10).toString();
    if (!containers.includes(newId)) {
      return newId;
    }
    return getRandomizedId(newId);
  }
  function getNewId(name: string) {
    let newContainerId = name
      .match(/\b([A-Za-z0-9])/g)!
      .join("")
      .toUpperCase();
    if (!containers.includes(newContainerId)) {
      return newContainerId;
    }
    return getRandomizedId(newContainerId);
  }

  function handleAddColumn(name: string) {
    let newContainerId = getNewId(name);

    if (newList) {
      unstable_batchedUpdates(() => {
        setNewList(undefined);
        setContainers((containers) => [...containers, newContainerId]);

        setItems((items) => ({
          ...items,
          [newContainerId]: { members: [], name, votes: 0 },
        }));
      });
    }
  }

  function getNextContainerId() {
    const containerIds = Object.keys(items);
    const lastContainerId = containerIds[containerIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }
}
