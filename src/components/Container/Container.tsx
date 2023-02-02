import React, { forwardRef } from "react";
import classNames from "classnames";

import { Handle, Remove } from "../Item";

import styles from "./Container.module.css";
import { Edit } from "../Item/components";

export interface Props {
  children: React.ReactNode;
  columns?: number;
  label?: string;
  style?: React.CSSProperties;
  horizontal?: boolean;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<any>;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
  itemPlaceholder?: boolean;
  unstyled?: boolean;
  onClick?(): void;
  onToggleEdit?(): void;
  onRemove?(): void;
  isEditing?: boolean;
}

export const Container = forwardRef<HTMLDivElement, Props>(
  (
    {
      children,
      columns = 1,
      handleProps,
      horizontal,
      hover,
      onClick,
      onToggleEdit,
      onRemove,
      label,
      placeholder,
      itemPlaceholder,
      style,
      scrollable,
      shadow,
      unstyled,
      isEditing,
      ...props
    }: Props,
    ref
  ) => {
    const Component = onClick ? "button" : "div";

    return (
      <Component
        {...props}
        // @ts-expect-error
        ref={ref ?? undefined}
        style={
          {
            ...style,
            "--columns": columns,
          } as React.CSSProperties
        }
        className={classNames(
          styles.Container,
          unstyled && styles.unstyled,
          horizontal && styles.horizontal,
          hover && styles.hover,
          placeholder && styles.placeholder,
          itemPlaceholder && (styles.placeholder, styles.itemPlaceholder),
          scrollable && styles.scrollable,
          shadow && styles.shadow
        )}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {label ? (
          <div className={styles.Header}>
            {label}
            <div className={styles.Actions}>
              {onToggleEdit ? <Edit onClick={onToggleEdit} isActive={isEditing} /> : undefined}
              {onRemove ? <Remove onClick={onRemove} /> : undefined}
              <Handle {...handleProps} />
            </div>
          </div>
        ) : null}
        {placeholder ? children : <ul>{children}</ul>}
      </Component>
    );
  }
);
