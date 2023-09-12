import { useMemo } from 'react';
import { debounce } from '@js-toolkit/utils/debounce';
import { preventDefault } from '@js-toolkit/web-utils/preventDefault';
import useMemoDestructor from './useMemoDestructor';
import useRefCallback from './useRefCallback';

type BaseEvent = PartialSome<Pick<React.TouchEvent, 'timeStamp' | 'detail' | 'persist'>, 'persist'>;
type BaseHandler<E> = (event: E) => any;

export interface UseLongPressProps {
  readonly delay?: number | undefined;
  readonly preventDefault?: boolean | undefined;
}

export interface UseLongPressResult<E extends BaseEvent> {
  readonly onDown: (event: E) => void;
  readonly onUp: (event: E) => void;
}

export default function useLongPress<
  E extends BaseEvent,
  H extends BaseHandler<E> = BaseHandler<E>,
>(
  callback: H,
  { delay = 500, preventDefault: preventDefaultProp }: UseLongPressProps = {}
): UseLongPressResult<E> {
  const callbackRef = useRefCallback(callback);

  const callbackDebounced = useMemoDestructor(
    () => [debounce(callbackRef, delay), (d) => d.cancel()],
    [callbackRef, delay]
  );

  return useMemo(
    () => ({
      onDown: (event) => {
        preventDefaultProp && event instanceof Event && preventDefault(event);
        // event.persist && event.persist();
        callbackDebounced(...([event] as Parameters<H>));
      },
      onUp: (event) => {
        callbackDebounced.isPending &&
          preventDefaultProp &&
          event instanceof Event &&
          preventDefault(event);
        callbackDebounced.cancel();
      },
    }),
    [callbackDebounced, preventDefaultProp]
  );
}
