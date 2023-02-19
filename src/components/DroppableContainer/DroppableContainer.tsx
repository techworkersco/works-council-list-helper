import React, { useState } from "react";
import { UniqueIdentifier } from "@dnd-kit/core";
import {
  AnimateLayoutChanges,
  useSortable,
  defaultAnimateLayoutChanges,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";

import { Container, ContainerProps } from "..";

import { ListMember, ListItem } from "../../types";

const animateLayoutChanges: AnimateLayoutChanges = (args) =>
  defaultAnimateLayoutChanges({ ...args, wasDragging: true });

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

export function DroppableContainer({
  children,
  columns = 1,
  disabled,
  id,
  items,
  style,
  onToggleEdit,
  onRenameList,
  label,
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
      type: "list",
      children: items,
    },
    animateLayoutChanges,
  });
  const [isEditingList, setIsEditingList] = useState<boolean>(false);
  const isOverContainer = over
    ? (id === over.id && active?.data.current?.type !== "list") ||
      items.some((list) => list.id === over.id)
    : false;

  if (isEditingList) {
    label = (
      <ListEditForm
        onChange={onRenameList}
        // @ts-expect-error
        list={{ id, name: label, members: [], votes: 0 }}
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
      label={label}
      {...props}
    >
      {children}
    </Container>
  );
}
