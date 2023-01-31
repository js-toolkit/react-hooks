import { useEffect, useMemo, useRef } from 'react';
import debounce from '@jstoolkit/utils/debounce';
import useRefCallback from './useRefCallback';

export interface UseDoubleClickProps<T = Element> {
  onClick?: (...params: Parameters<React.MouseEventHandler<T>>) => boolean | void;
  // click?: {
  //   handler: (...params: Parameters<React.MouseEventHandler<T>>) => boolean | void;
  //   /** Default `true` */
  //   ignoreOnDoubleClick?: boolean;
  // };
  debounceClick?: {
    handler: React.MouseEventHandler<T>;
    wait: number;
  };
  onDoubleClick: React.MouseEventHandler<T>;
}

export default function useDoubleClick<T = Element>(
  factory: () => UseDoubleClickProps<T>,
  deps: React.DependencyList = []
): React.MouseEventHandler<T> {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { onClick, debounceClick, onDoubleClick } = useMemo(factory, deps);

  const onDebounceClick = debounceClick?.handler;
  const debounceWait = debounceClick?.wait;

  const clickHandlerDebounced = useMemo(() => {
    return onDebounceClick
      ? debounce<React.MouseEventHandler<T>>(onDebounceClick, debounceWait)
      : undefined;
  }, [debounceWait, onDebounceClick]);

  const lastTimeRef = useRef(0);

  useEffect(
    () => () => {
      clickHandlerDebounced?.cancel();
    },
    [clickHandlerDebounced]
  );

  return useRefCallback<React.MouseEventHandler<T>>((event) => {
    // console.log('click', event.detail);

    const currentTime = event.timeStamp;
    const delay = currentTime - lastTimeRef.current;
    const doubleClick =
      (event.detail > 0 && event.detail % 2 === 0 && lastTimeRef.current > 0) ||
      // On old ios versions `event.detail` always equals `1`, so checking delay manually
      (event.detail === 1 && delay > 0 && delay <= 300);

    if (doubleClick) {
      lastTimeRef.current = 0;
      // Cancel if double click
      clickHandlerDebounced?.cancel();
      onDoubleClick(event);
      return;
    }

    const res = onClick && onClick(event);
    if (res === false) {
      lastTimeRef.current = 0;
      return;
    }

    // Start debounce
    if (clickHandlerDebounced) {
      event.persist();
      clickHandlerDebounced(event);
    }

    lastTimeRef.current = currentTime;
  });
}
