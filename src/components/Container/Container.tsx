import React, { forwardRef } from "react";
import classNames from "classnames";

import { Remove } from "../Item";

import styles from "./Container.module.css";
import { Edit } from "../Item/components";

export interface Props {
  children: React.ReactNode;
  columns?: number;
  label?: string | React.ReactElement;
  style?: React.CSSProperties;
  horizontal?: boolean;
  hover?: boolean;
  handleProps?: React.HTMLAttributes<any>;
  scrollable?: boolean;
  shadow?: boolean;
  placeholder?: boolean;
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
          scrollable && styles.scrollable,
          shadow && styles.shadow
        )}
        onClick={onClick}
        tabIndex={onClick ? 0 : undefined}
      >
        {label ? (
          <div className={styles.Header}>
            <div style={{ display: "flex", padding: 12 }}>{label}</div>
            <div className={styles.Actions}>
              {onToggleEdit ? <Edit aria-label="Edit list" onClick={onToggleEdit} isActive={isEditing} /> : undefined}
              {onRemove ? <Remove aria-label="Remove list" onClick={onRemove} /> : undefined}
              {/* <Handle aria-label="Move list" {...handleProps} /> */}
            </div>
          </div>
        ) : null}
        {placeholder ? children : <ul>{children}</ul>}
      </Component>
    );
  }
);
