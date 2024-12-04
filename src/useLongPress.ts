import React from 'react';
import { noop } from '@js-toolkit/utils/noop';
import { hasIn } from '@js-toolkit/utils/hasIn';
import { debounce } from '@js-toolkit/utils/debounce';
// import { preventDefault } from '@js-toolkit/web-utils/preventDefault';
import useMemoDestructor from './useMemoDestructor';
import useRefCallback from './useRefCallback';

// type BaseEvent = PartialSome<Pick<React.TouchEvent, 'timeStamp' | 'detail' | 'persist'>, 'persist'>;

export interface UseLongPressProps<E /* extends BaseEvent */, D> {
  readonly delay?: number | undefined;
  // readonly preventDefault?: boolean | undefined;
  /** Use `setPointerCapture`. Defaults to `true`. */
  readonly captureEvents?: boolean | undefined;
  /** Filter event before activating then longpress timer. */
  readonly filter?: (event: E) => boolean;
  /** If longpress timer was activated but not invoked yet. */
  readonly onCancel?: (event: E) => unknown;
  /** If longpress timer was activated and invoked. */
  readonly onEnd?: (event: E, callbackData: D) => unknown;
  /** If longpress timer was not activated. */
  readonly fallback?: (event: E) => unknown;
}

export interface UseLongPressResult<E /* extends BaseEvent */> {
  readonly onDown: (event: E) => void;
  readonly onUp: (event: E) => void;
  readonly isPressed: () => boolean;
}

interface LongPressResult<E> extends UseLongPressResult<E> {
  readonly cancel: VoidFunction;
}

// function isEventLike(event: unknown): event is Pick<Event, 'preventDefault'> {
//   return hasIn(event as Event, 'preventDefault');
// }

function isPointerEventLike(
  event: unknown
): event is Pick<React.PointerEvent, 'pointerId' | 'pointerType' | 'currentTarget'> {
  return (
    hasIn(event as React.PointerEvent, 'pointerId') &&
    hasIn(event as React.PointerEvent, 'pointerType')
  );
}

/**
 * Example of using:
 * ```
 * onPointerDown={longPress.onDown}
 * onPointerUp={longPress.onUp}
 * onPointerCancel={longPress.onUp}
 * onContextMenu={longPress.onUp} // onPointerUp is not invoked if contextmenu is not prevented.
 * ```
 */
export function getLongPress<E, D = unknown>(
  callback: (event: E) => D,
  {
    delay = 500,
    // preventDefault: preventDefaultProp,
    captureEvents = true,
    filter,
    onCancel,
    onEnd,
    fallback,
  }: UseLongPressProps<E, D> = {}
): LongPressResult<E> {
  let pressed = false;
  // let prevented = false;
  // It needs for if event is filtered out.
  let callbackInvoked = false;
  let callbackData: D;

  const debouncedCallback = debounce((event: E, currentTarget: Element | undefined): D => {
    if (captureEvents && currentTarget && isPointerEventLike(event)) {
      currentTarget.setPointerCapture(event.pointerId);
    }
    callbackInvoked = true;
    callbackData = callback(event);
    return callbackData;
  }, delay);

  return {
    onDown: (event) => {
      pressed = true;
      if (filter && !filter(event)) return;

      // if (preventDefaultProp && isEventLike(event)) {
      //   preventDefault(event);
      //   prevented = true;
      // }

      callbackInvoked = false;
      (event as React.SyntheticEvent)?.persist();
      debouncedCallback(event, (event as React.SyntheticEvent).currentTarget);
    },
    onUp: (event) => {
      if (isPointerEventLike(event) && event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }

      pressed = false;

      // if (prevented && isEventLike(event)) {
      //   preventDefault(event);
      //   prevented = false;
      // }

      if (debouncedCallback.isPending) {
        debouncedCallback.cancel();
        if (onCancel) onCancel(event);
      } else if (callbackInvoked) {
        if (onEnd) onEnd(event, callbackData);
      } else if (fallback) {
        fallback(event);
      }

      callbackInvoked = false;
    },
    isPressed: () => pressed,
    cancel: () => {
      debouncedCallback.cancel();
      // pressed = false;
      // callbackInvoked = false;
      // callbackData = undefined as D;
    },
  };
}

function trueFn(): boolean {
  return true;
}

export default function useLongPress<E /* extends BaseEvent */, D = unknown>(
  callback: (event: E) => D,
  {
    delay = 500,
    // preventDefault: preventDefaultProp,
    captureEvents = true,
    filter,
    onCancel,
    onEnd,
    fallback,
  }: UseLongPressProps<E, D> = {}
): UseLongPressResult<E> {
  const callbackRef = useRefCallback(callback);
  const filterRef = useRefCallback(filter ?? trueFn);
  const onCancelRef = useRefCallback(onCancel ?? noop);
  const onEndRef = useRefCallback(onEnd ?? noop);
  const fallbackRef = useRefCallback(fallback ?? noop);

  return useMemoDestructor(() => {
    const longPress = getLongPress(callbackRef, {
      delay,
      captureEvents,
      filter: filterRef,
      onCancel: onCancelRef,
      onEnd: onEndRef,
      fallback: fallbackRef,
    });
    return [
      {
        onDown: longPress.onDown,
        onUp: longPress.onUp,
        isPressed: longPress.isPressed,
      },
      longPress.cancel,
    ];
  }, [callbackRef, captureEvents, delay, fallbackRef, filterRef, onCancelRef, onEndRef]);
}
