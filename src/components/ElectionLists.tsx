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
import { coordinateGetter as multipleContainersCoordinateGetter } from "./multipleContainerKeyboardCoordinates";

import { Item, Container, ContainerProps } from ".";

import { createRange } from "../utilities/createRange";
import { getColor } from "../utilities/getColor";

import { SortableItem } from "./SortableItem/SortableItem";
import { Edit } from "./Item/components";
import style from "./Item/Item.module.css";
// import { useListStore } from "../store";

export default {
  title: "Presets/Sortable/Multiple Containers",
};

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

enum Gender {
  man = "man",
  woman = "woman",
  divers = "divers",
}

export type ListMember = { id: UniqueIdentifier; gender: Gender };
type Item = { name: string; members: ListMember[] };
type Items = Record<UniqueIdentifier, Item>;

const renderActions = () => <Edit className={style.Edit} />;

function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  onToggleEdit,
  ...props
}: ContainerProps & {
  disabled?: boolean;
  id: UniqueIdentifier;
  items: ListMember[];
  style?: React.CSSProperties;
  onToggleEdit?: ContainerProps["onToggleEdit"];
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
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "container") ||
      items.some((item) => item.id === over.id)
    : false;

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
      onToggleEdit={onToggleEdit}
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
}

const PLACEHOLDER_ID = "placeholder";
const empty: ListMember[] = [];

export function ElectionLists({
  adjustScale = false,
  itemCount = 3,
  cancelDrop,
  columns,
  handle = false,
  items: initialItems,
  containerStyle,
  coordinateGetter = multipleContainersCoordinateGetter,
  getItemStyles = () => ({}),
  wrapperStyle = () => ({}),
  minimal = false,
  modifiers,
  renderItem,
  strategy = verticalListSortingStrategy,
  vertical = false,
  scrollable,
}: Props) {
  // TODO: use zustand instead of use state below.
  // const { lists } = useListStore();
  const [items, setItems] = useState<Items>(
    () =>
      initialItems ?? {
        A: {
          name: "A",
          members: createRange(itemCount, (index) => ({
            id: `A.${index + 1}`,
            gender: Gender.woman,
          })),
        },
        B: {
          name: "B",
          members: createRange(itemCount, (index) => ({
            id: `B.${index + 1}`,
            gender: Gender.woman,
          })),
        },
        C: {
          name: "C",
          members: createRange(itemCount, (index) => ({
            id: `C.${index + 1}`,
            gender: Gender.woman,
          })),
        },
        D: {
          name: "D",
          members: createRange(itemCount, (index) => ({
            id: `D.${index + 1}`,
            gender: Gender.woman,
          })),
        },
      }
  );
  const [containers, setContainers] = useState(
    Object.keys(items) as UniqueIdentifier[]
  );
  const [activeId, setActiveId] = useState<UniqueIdentifier | null>(null);
  const lastOverId = useRef<UniqueIdentifier | null>(null);
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

  const getIndex = (id: UniqueIdentifier, coll: Item) => {
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
    console.log(items);

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
                members: [{ id: active.id, gender: Gender.woman }],
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
          {containers.map((containerId) => (
            <DroppableContainer
              key={containerId}
              id={containerId}
              label={minimal ? undefined : items[containerId].name}
              columns={columns}
              items={items[containerId].members}
              scrollable={scrollable}
              style={containerStyle}
              unstyled={minimal}
              onRemove={() => handleRemoveColumn(containerId)}
              onToggleEdit={() => {}}
            >
              <SortableContext
                items={items[containerId].members}
                strategy={strategy}
              >
                {items[containerId].members.map((member, index) => {
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
                      renderActions={renderActions}
                    />
                  );
                })}
              </SortableContext>
            </DroppableContainer>
          ))}
          {minimal ? undefined : (
            <DroppableContainer
              id={PLACEHOLDER_ID}
              disabled={isSortingContainer}
              items={empty}
              onClick={handleAddColumn}
              placeholder
            >
              + Add list
            </DroppableContainer>
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
        (member) => member.id == activeId
      );
      if (member) {
        return (
          <Item
            member={member}
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
            color={getColor(member.id)}
            wrapperStyle={wrapperStyle({ index: 0 })}
            renderItem={renderItem}
            renderActions={renderActions}
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
            member={member}
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
            color={getColor(member.id)}
            wrapperStyle={wrapperStyle({ index })}
            renderItem={renderItem}
            renderActions={renderActions}
          />
        ))}
      </Container>
    );
  }

  function handleRemoveColumn(containerID: UniqueIdentifier) {
    setContainers((containers) =>
      containers.filter((id) => id !== containerID)
    );
  }

  function handleRemoveItem(index: number, containerID: UniqueIdentifier) {
    items[containerID].members.splice(index, 1);
    // setContainers((containers) =>
    //   containers.filter((id) => id !== containerID)
    // );
    setItems((items) => ({
      ...items,
      [containerID]: items[containerID],
    }));
  }

  function handleAddColumn() {
    const newContainerId = getNextContainerId();

    unstable_batchedUpdates(() => {
      setContainers((containers) => [...containers, newContainerId]);
      setItems((items) => ({
        ...items,
        [newContainerId]: { members: [], name: `List ${newContainerId}` },
      }));
    });
  }

  function getNextContainerId() {
    const containerIds = Object.keys(items);
    const lastContainerId = containerIds[containerIds.length - 1];

    return String.fromCharCode(lastContainerId.charCodeAt(0) + 1);
  }
}
