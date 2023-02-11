import React, { useEffect, useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import { useSortable } from "@dnd-kit/sortable";

import { Item } from "../";

import { ItemProps } from "../Item";

import { getColor } from "../../utilities/getColor";
import { ListMember, SingularGenders, GenderEnum } from "../../types";

import styles from "./SortableItem.module.css";
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
  status: { isPopularlyElected?: boolean, isOverflowElected?: boolean }
}

// const buttonStyles = { display: "block" };

// export function ItemForm({
//   member,
//   onChangeItem,
// }: {
//   member: ListMember;
//   onChangeItem?: (member: ListMember) => void;
// }) {
//   const [changed, setChanged] = useState<string | undefined>();
//   return (
//     <>
//       <div>
//         {genderArray.map((gender) => (
//           <Button
//             style={
//               (!changed && member.gender === gender) || changed === gender
//                 ? { ...buttonStyles, backgroundColor: "whitesmoke", color: "black" }
//                 : buttonStyles
//             }
//             aria-disabled={member.gender === gender}
//             onClick={() => {
//               setChanged(gender);
//               onChangeItem && onChangeItem({ ...member, gender });
//             }}
//             key={member.id + gender}
//           >
//             {SingularGenders[gender]}
//           </Button>
//         ))}
//       </div>
//     </>
//   );
// }

export function ItemContent({
  member,
  isEditing = false,
  setEditing,
  onChangeItem,
}: {
  member: ListMember;
  isEditing?: boolean;
  onChangeItem?: (member: ListMember) => void;
  setEditing?: (toggle: boolean) => void;
}) {
  const genders = Object.values(GenderEnum) as GenderEnum[];

  return (
    <div className={styles.ItemContent}>
      <div>
        {member.id}{" "}
        {!isEditing ? (
          <span
            role="button"
            aria-label="Modify list member gender"
            onClick={() => {
              console.log("clicked");
              setEditing && setEditing(!isEditing);
            }}
          >
            {SingularGenders[member.gender]}
          </span>
        ) : (
          <select
            autoFocus
            tabIndex={0}
            aria-label="Select list member gender"
            defaultValue={member.gender}
            onChange={(e) => {
              onChangeItem &&
                onChangeItem({
                  ...member,
                  gender: e.target.value as GenderEnum,
                });
              setEditing && setEditing(false);
            }}
            onAbort={(e) => {
              setEditing && setEditing(false);
            }}
          >
            {genders.map((gender) => {
              return (
                <option key={member.id + gender} value={gender}>
                  {SingularGenders[gender]}
                </option>
              );
            })}
          </select>
        )}
      </div>
      {/* {isEditing && <ItemForm member={member} onChangeItem={onChangeItem} />} */}
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
  status
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
          setEditing={setEditing}
        />
      }
      dragging={isDragging}
      sorting={isSorting}
      handle={handle}
      handleProps={handle ? { ref: setActivatorNodeRef } : undefined}
      index={index}
      wrapperStyle={wrapperStyle({ index })}
      isEditing={isEditing}
      style={style({
        index,
        value: member.id,
        isDragging,
        isSorting,
        overIndex: over ? getIndex(over.id) : overIndex,
        containerId,
      })}
      onRemove={onRemove}
      color={getColor(status)}
      transition={transition}
      transform={transform}
      fadeIn={mountedWhileDragging}
      listeners={listeners}
      renderItem={renderItem}
      renderActions={() => (
        <Edit
          aria-label="Edit list item"
          isActive={isEditing}
          onClick={() => setEditing(!isEditing)}
        />
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
