import { useCallback, useMemo, useRef } from 'react';

export default function useDoubleTap<T>(
  factory: () => {
    handler: React.TouchEventHandler<T>;
    tapHandler?: (...params: Parameters<React.TouchEventHandler<T>>) => boolean | void;
    /** Default `300` */
    delay?: number;
  },
  deps: React.DependencyList = []
): React.TouchEventHandler<T> {
  const lastTimeRef = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { handler, tapHandler, delay = 300 } = useMemo(factory, deps);

  return useCallback<React.TouchEventHandler<T>>(
    (event) => {
      const res = tapHandler && tapHandler(event);
      if (res === false) return;

      const currentTime = event.timeStamp;
      const delta = currentTime - lastTimeRef.current;

      if (delta > 0 && delta <= delay) {
        lastTimeRef.current = 0;
        handler(event);
      } else {
        lastTimeRef.current = currentTime;
      }
    },
    [delay, handler, tapHandler]
  );
}
