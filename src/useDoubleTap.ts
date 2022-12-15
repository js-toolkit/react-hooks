import { useCallback, useMemo, useRef } from 'react';

export default function useDoubleTap<T>(
  factory: () => {
    handler: React.TouchEventHandler<T>;
    /** Default `300` */
    delay?: number;
  },
  deps: React.DependencyList = []
): React.TouchEventHandler<T> {
  const lastTapTimeRef = useRef(0);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const { handler, delay = 300 } = useMemo(factory, deps);

  return useCallback<React.TouchEventHandler<T>>(
    (event) => {
      const currentTapTime = Date.now();
      const tapLength = currentTapTime - lastTapTimeRef.current;

      if (tapLength > 0 && tapLength <= delay) {
        // lastTapTimeRef.current = 0;
        lastTapTimeRef.current = currentTapTime;
        handler(event);
      } else {
        lastTapTimeRef.current = currentTapTime;
      }
    },
    [delay, handler]
  );
}
