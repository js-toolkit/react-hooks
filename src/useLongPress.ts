import React from 'react';
import { noop } from '@js-toolkit/utils/noop';
import { hasIn } from '@js-toolkit/utils/hasIn';
import { debounce } from '@js-toolkit/utils/debounce';
// import { preventDefault } from '@js-toolkit/web-utils/preventDefault';
import useMemoDestructor from './useMemoDestructor';
import useRefCallback from './useRefCallback';

// type BaseEvent = PartialSome<Pick<React.TouchEvent, 'timeStamp' | 'detail' | 'persist'>, 'persist'>;
type BaseEvent = PartialSome<
  Pick<
    React.PointerEvent,
    'preventDefault' | 'cancelable' | 'currentTarget' | 'target' | 'persist'
  >,
  'persist'
>;

export interface UseLongPressProps<E extends BaseEvent, D> {
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

export interface UseLongPressResult<E extends BaseEvent> {
  readonly onDown: (event: E) => void;
  readonly onUp: (event: E) => void;
  readonly isPressed: () => boolean;
}

export interface LongPressHandlers<E extends BaseEvent> extends UseLongPressResult<E> {
  readonly cancel: VoidFunction;
}

// function isEventLike(event: unknown): event is Pick<Event, 'preventDefault'> {
//   return hasIn(event as Event, 'preventDefault');
// }

function isPointerEventLike(
  event: unknown
): event is Pick<React.PointerEvent, 'pointerId' | 'pointerType' | 'currentTarget' | 'target'> {
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
export function getLongPressHandlers<E extends BaseEvent, D = unknown>(
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
): LongPressHandlers<E> {
  let pressed: E | undefined;
  // let prevented = false;
  // It needs for if event is filtered out.
  let callbackInvoked = false;
  let callbackData: D;
  let pointerCount = 0;
  // const pointersCache = new Map<number, E[]>();

  const debouncedCallback = debounce((event: E): D => {
    if (captureEvents && isPointerEventLike(event)) {
      (event.currentTarget ?? event.target)?.setPointerCapture(event.pointerId);
    }
    callbackInvoked = true;
    callbackData = callback(event);
    return callbackData;
  }, delay);

  const releaseCapture = (event: E): void => {
    if (isPointerEventLike(event)) {
      event.currentTarget?.hasPointerCapture(event.pointerId) &&
        event.currentTarget.releasePointerCapture(event.pointerId);
      (event.target as Element)?.hasPointerCapture(event.pointerId) &&
        (event.target as Element).releasePointerCapture(event.pointerId);
    }
  };

  const halt = (event: E): void => {
    if (debouncedCallback.isPending) {
      debouncedCallback.cancel();
      onCancel?.(event);
    }
  };

  const up = (event: E, reset = false): void => {
    if (pointerCount > 0 && !reset) {
      pointerCount -= 1;
    }
    releaseCapture(event);

    if (pointerCount === 0 || reset) pressed = undefined;
    // If still at least one pointer/touch is pressed, do nothing.
    else if (!reset) return;

    // if (prevented && isEventLike(event)) {
    //   preventDefault(event);
    //   prevented = false;
    // }

    if (debouncedCallback.isPending) {
      halt(event);
    } else if (callbackInvoked) {
      onEnd?.(event, callbackData);
    } else {
      fallback?.(event);
    }

    callbackInvoked = false;
  };

  const cancel = (): void => {
    if (pressed) {
      up(pressed, true);
    }
    pointerCount = 0;
    debouncedCallback.cancel();
  };

  return {
    onDown: (event) => {
      pointerCount += 1;
      // If at least one pointer/touch is already pressed,
      // do not invoke debouncedCallback again as it may already be invoked.
      if (pressed) {
        // Ignore next pointers if callbackInvoked.
        if (callbackInvoked) return;
        halt(pressed);
        releaseCapture(pressed);
        pressed = undefined;
      }
      if (pointerCount > 1) return;
      // if (isPointerEventLike(event)) {
      //   const events = pointersCache.get(event.pointerId) ?? [];
      //   events.push(event);
      //   pointersCache.set(event.pointerId, events);
      // }
      if (filter && !filter(event)) return;
      pressed = event;

      // if (preventDefaultProp && isEventLike(event)) {
      //   preventDefault(event);
      //   prevented = true;
      // }

      callbackInvoked = false;
      event.persist?.();
      debouncedCallback(event);
    },
    onUp: up,
    isPressed: () => !!pressed,
    cancel,
    // cancel: () => {
    //   debouncedCallback.cancel();
    //   // pointersCache.clear();
    //   // pointerCount = 0;
    //   // pressed = false;
    //   // callbackInvoked = false;
    //   // callbackData = undefined as D;
    // },
  };
}

function trueFn(): boolean {
  return true;
}

export default function useLongPress<E extends BaseEvent, D = unknown>(
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
    const longPress = getLongPressHandlers(callbackRef, {
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
