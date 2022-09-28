import { useEffect, useMemo, useRef } from 'react';
import debounce from 'lodash.debounce';
import useRefCallback from './useRefCallback';

export interface UseDoubleClickProps<T = Element> {
  onClick?: (...params: Parameters<React.MouseEventHandler<T>>) => false | void;
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
  const debounceClickedRef = useRef(false);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { onClick, onDoubleClick, debounceClick } = useMemo(factory, deps);

  const onDebounceClick = debounceClick?.handler;
  const debounceWait = debounceClick?.wait;

  const clickHandlerDebounced = useMemo(() => {
    return onDebounceClick
      ? debounce<React.MouseEventHandler<T>>((event) => {
          debounceClickedRef.current = true;
          onDebounceClick(event);
        }, debounceWait)
      : undefined;
  }, [debounceWait, onDebounceClick]);

  useEffect(
    () => () => {
      clickHandlerDebounced && clickHandlerDebounced.cancel();
    },
    [clickHandlerDebounced]
  );

  return useRefCallback<React.MouseEventHandler<T>>((event) => {
    // console.log('click', event.detail);
    event.persist();

    const res = onClick && onClick(event);
    if (res === false) return;

    // Reset on single clicks
    if (event.detail !== 2) {
      debounceClickedRef.current = false;
    }

    // start debounce
    clickHandlerDebounced && clickHandlerDebounced(event);

    if (event.detail === 2) {
      // Cancel if not yet debounced
      if (!debounceClickedRef.current && clickHandlerDebounced) clickHandlerDebounced.cancel();
      onDoubleClick(event);
    }
  });
}
