import React from 'react';
import { debounce } from '@js-toolkit/utils/debounce';
import useRefCallback from './useRefCallback';

type BaseEvent = PartialSome<Pick<React.TouchEvent, 'timeStamp' | 'detail' | 'persist'>, 'persist'>;
type BaseHandler<E> = (event: E) => any;

export interface UseDoubleClickProps<
  E extends BaseEvent,
  H extends BaseHandler<E> = BaseHandler<E>,
> {
  readonly onClick?: (...params: Parameters<H>) => boolean | void;
  readonly debounceClick?: {
    readonly handler: H;
    readonly delay: number;
  };
  /** If event is not supported detecting clicks count then using this value. Defaults to 350ms. */
  readonly delay?: number;
  readonly onDoubleClick: H;
}

export default function useDoubleClick<
  E extends BaseEvent,
  H extends BaseHandler<E> = BaseHandler<E>,
>(factory: () => UseDoubleClickProps<E, H>, deps: React.DependencyList = []): H {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const {
    onClick,
    debounceClick,
    delay: defaultDelay = 350,
    onDoubleClick,
  } = React.useMemo(factory, deps);

  const onDebounceClick = debounceClick?.handler;
  const debounceDelay = debounceClick?.delay;

  const clickHandlerDebounced = React.useMemo(() => {
    return onDebounceClick ? debounce<H>(onDebounceClick, debounceDelay) : undefined;
  }, [debounceDelay, onDebounceClick]);

  const lastTimeRef = React.useRef(0);

  React.useEffect(
    () => () => {
      clickHandlerDebounced?.cancel();
    },
    [clickHandlerDebounced]
  );

  return useRefCallback((...params: Parameters<H>) => {
    const event = params[0];
    // console.log('click', event.detail);

    const currentTime = event.timeStamp;
    const delay = currentTime - lastTimeRef.current;
    const doubleClick =
      (event.detail > 0 && event.detail % 2 === 0 && lastTimeRef.current > 0) ||
      // On old ios versions `event.detail` always equals `1`,
      // on other than mouse events `event.detail` always equals `0`
      // so checking delay manually.
      ((event.detail <= 1) && delay > 0 && delay <= defaultDelay);

    if (doubleClick) {
      lastTimeRef.current = 0;
      // Cancel if double click
      clickHandlerDebounced?.cancel();
      onDoubleClick(event);
      return;
    }

    const res = onClick && onClick(...params);
    if (res === false) {
      lastTimeRef.current = 0;
      return;
    }

    // Start debounce
    if (clickHandlerDebounced) {
      if (event.persist) event.persist();
      clickHandlerDebounced(...params);
    }

    lastTimeRef.current = currentTime;
  }) as H;
}
