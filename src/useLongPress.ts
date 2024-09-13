import React from 'react';
import { debounce } from '@js-toolkit/utils/debounce';
import { hasIn } from '@js-toolkit/utils/hasIn';
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

  const filterRef = React.useRef(filter);
  filterRef.current = filter;

  const onCancelRef = React.useRef(onCancel);
  onCancelRef.current = onCancel;

  const onEndRef = React.useRef(onEnd);
  onEndRef.current = onEnd;

  const fallbackRef = React.useRef(fallback);
  fallbackRef.current = fallback;

  return useMemoDestructor(() => {
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
      callbackData = callbackRef(event);
      return callbackData;
    }, delay);
    return [
      {
        onDown: (event) => {
          pressed = true;
          if (filterRef.current && !filterRef.current(event)) return;

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
            if (onCancelRef.current) onCancelRef.current(event);
          } else if (callbackInvoked) {
            if (onEndRef.current) onEndRef.current(event, callbackData);
          } else if (fallbackRef.current) {
            fallbackRef.current(event);
          }

          callbackInvoked = false;
        },
        isPressed: () => pressed,
      },
      () => debouncedCallback.cancel(),
    ];
  }, [callbackRef, delay]);
}
