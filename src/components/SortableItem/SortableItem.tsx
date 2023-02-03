import React, { useEffect, useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";

import { Button, Item } from "../";

import { ItemProps } from "../Item";

import { getColor } from "../../utilities/getColor";
import { ListMember, Gender } from "../../types";
import { Edit } from "../Item/components";

interface SortableItemProps {
  containerId: UniqueIdentifier;
  member: ListMember;
  index: number;
  handle: boolean;
  disabled?: boolean;
  onRemove?: ItemProps["onRemove"];
  renderActions?: ItemProps["renderActions"];
  style(args: any): React.CSSProperties;
  getIndex(id: UniqueIdentifier): number;
  renderItem(): React.ReactElement;
  wrapperStyle({ index }: { index: number }): React.CSSProperties;
  onChangeItem: (member: ListMember) => void;
}

const genderArray = [Gender.man, Gender.woman, Gender.nonbinary];

const styles = { display: "block" };

export function ItemForm({
  member,
  onChangeItem,
}: {
  member: ListMember;
  onChangeItem?: (member: ListMember) => void;
}) {
  const [changed, setChanged] = useState<string | undefined>();
  return (
    <>
      <div>
        {genderArray.map((gender) => (
          <Button
            style={
              (!changed && member.gender === gender) || changed === gender
                ? { ...styles, backgroundColor: "whitesmoke", color: "black" }
                : styles
            }
            aria-disabled={member.gender === gender}
            onClick={() => {
              setChanged(gender);
              onChangeItem && onChangeItem({ ...member, gender });
            }}
            key={member.id + gender}
          >
            {gender}
          </Button>
        ))}
      </div>
    </>
  );
}

export function ItemContent({
  member,
  isEditing = false,
  onChangeItem,
}: {
  member: ListMember;
  isEditing?: boolean;
  onChangeItem?: (member: ListMember) => void;
}) {
  return (
    <div>
      <div>
        {member.id} <i>{member.gender}</i>
      </div>
      {isEditing && <ItemForm member={member} onChangeItem={onChangeItem} />}
    </div>
  );
}

export function SortableItem({
  disabled,
  index,
  handle,
  renderItem,
  style,
  containerId,
  getIndex,
  wrapperStyle,
  onRemove,
  onChangeItem,
  member,
}: SortableItemProps) {
  const [isEditing, setEditing] = useState(false);
  const {
    setNodeRef,
    setActivatorNodeRef,
    listeners,
    isDragging,
    isSorting,
    over,
    overIndex,
    transform,
    transition,
  } = useSortable({
    id: member.id,
  });
  const mounted = useMountStatus();
  const mountedWhileDragging = isDragging && !mounted;

  return (
    <Item
      ref={disabled ? undefined : setNodeRef}
      value={
        <ItemContent
          member={member}
          isEditing={isEditing}
          onChangeItem={onChangeItem}
        />
      }
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      style={style({
        index,
        value: member.id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      onRemove={onRemove}
      color={getColor(member.id)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
      renderActions={() => (
        <Edit isActive={isEditing} onClick={() => setEditing(!isEditing)} />
      )}
    />
  );
}

function useMountStatus() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    const timeout = setTimeout(() => setIsMounted(true), 500);

    return () => clearTimeout(timeout);
  }, []);

  return isMounted;
}
