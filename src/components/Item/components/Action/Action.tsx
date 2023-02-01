import React, { forwardRef, CSSProperties } from "react";
import classNames from "classnames";

import styles from "./Action.module.css";

export interface Props extends React.HTMLAttributes<HTMLButtonElement> {
  isActive?: boolean;
  active?: {
    fill: string;
    background: string;
  };
  cursor?: CSSProperties["cursor"];
}

export const Action = forwardRef<HTMLButtonElement, Props>(
  ({ active, className, cursor, style, isActive, ...props }, ref) => {
    return (
      <button
        ref={ref}
        {...props}
        className={classNames(
          styles.Action,
          isActive ? styles.active : null,
          className
        )}
        tabIndex={0}
        style={
          {
            ...style,
            cursor,
            "--fill": active?.fill,
            "--background": active?.background,
          } as CSSProperties
        }
      />
    );
  }
);
