import React from 'react';
import useRefCallback from './useRefCallback';

export type UseHoverCallbacksProps<T> = Pick<
  React.HTMLAttributes<T>,
  'onMouseEnter' | 'onMouseLeave' | 'onTouchStart' | 'onClick' | 'onContextMenu'
>;

export type UseHoverCallbacksResult<T> = Required<UseHoverCallbacksProps<T>>;

/**
 * Prevents mouseenter/mouseleave events on touch.
 */
export default function useHoverCallbacks<T = Element>({
  onMouseEnter,
  onMouseLeave,
  onTouchStart,
  onClick,
  onContextMenu,
}: UseHoverCallbacksProps<T>): UseHoverCallbacksResult<T> {
  /** To prevent mouseenter on touch. */
  const isTouchingRef = React.useRef(false);

  const touchStartHandler = useRefCallback<React.TouchEventHandler<T>>((event) => {
    // console.log('touchStart', event.nativeEvent.type);
    isTouchingRef.current = true;
    if (onTouchStart) onTouchStart(event);
  });

  const contextMenuHandler = useRefCallback<React.MouseEventHandler<T>>((event) => {
    // console.log('contextMenu', event.nativeEvent.type);
    isTouchingRef.current = false;
    if (onContextMenu) onContextMenu(event);
  });

  const clickHandler = useRefCallback<React.MouseEventHandler<T>>((event) => {
    // console.log('click', event.nativeEvent.type);
    isTouchingRef.current = false;
    if (onClick) onClick(event);
  });

  const mouseEnterHandler = useRefCallback<React.MouseEventHandler<T>>((event) => {
    // console.log('mouseEnter', event.nativeEvent.type, event.nativeEvent);
    if (isTouchingRef.current) return;
    // tooltip && onShowTooltip && setHover(true, event.currentTarget);
    if (onMouseEnter) onMouseEnter(event);
  });

  const mouseLeaveHandler = useRefCallback<React.MouseEventHandler<T>>((event) => {
    // console.log('mouseLeave', event.nativeEvent.type, event.nativeEvent);
    if (isTouchingRef.current) return;
    // (getHover() || tooltip) && onHideTooltip && setHover(false, event.currentTarget);
    if (onMouseLeave) onMouseLeave(event);
  });

  return {
    onMouseEnter: mouseEnterHandler,
    onMouseLeave: mouseLeaveHandler,
    onTouchStart: touchStartHandler,
    onClick: clickHandler,
    onContextMenu: contextMenuHandler,
  };
}
