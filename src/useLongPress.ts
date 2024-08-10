import React from 'react';
import { debounce } from '@js-toolkit/utils/debounce';
import { preventDefault } from '@js-toolkit/web-utils/preventDefault';
import useMemoDestructor from './useMemoDestructor';
import useRefCallback from './useRefCallback';

type BaseEvent = PartialSome<Pick<React.TouchEvent, 'timeStamp' | 'detail' | 'persist'>, 'persist'>;

export interface UseLongPressProps<E extends BaseEvent, D> {
  readonly delay?: number | undefined;
  readonly preventDefault?: boolean | undefined;
  readonly filter?: (event: E) => boolean;
  /** If longpress was activated but not invoked yet. */
  readonly onCancel?: (event: E) => unknown;
  /** If longpress was activated and invoked. */
  readonly onEnd?: (event: E, callbackData: D) => unknown;
  /** If longpress was not activated. */
  readonly fallback?: (event: E) => unknown;
}

export interface UseLongPressResult<E extends BaseEvent> {
  readonly onDown: (event: E) => void;
  readonly onUp: (event: E) => void;
}

export default function useLongPress<E extends BaseEvent, D = unknown>(
  callback: (event: E) => D,
  {
    delay = 500,
    preventDefault: preventDefaultProp,
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
    let prevented = false;
    // It needs for if event is filtered out.
    let invoked = false;
    let callbackData: D;
    // const debouncedCallback = debounce(callbackRef, delay);
    const debouncedCallback = debounce<typeof callbackRef>((...args) => {
      invoked = true;
      callbackData = callbackRef(...args);
      return callbackData;
    }, delay);
    return [
      {
        onDown: (event) => {
          if (filterRef.current && !filterRef.current(event)) return;
          if (preventDefaultProp && event instanceof Event) {
            preventDefault(event);
            prevented = true;
          }
          invoked = false;
          // event.persist && event.persist();
          debouncedCallback(event);
        },
        onUp: (event) => {
          if (prevented && event instanceof Event) {
            preventDefault(event);
            prevented = false;
          }
          if (debouncedCallback.isPending) {
            debouncedCallback.cancel();
            if (onCancelRef.current) onCancelRef.current(event);
          } else if (invoked) {
            if (onEndRef.current) onEndRef.current(event, callbackData);
          } else if (fallbackRef.current) {
            fallbackRef.current(event);
          }
        },
      },
      () => debouncedCallback.cancel(),
    ];
  }, [callbackRef, delay, preventDefaultProp]);
}
