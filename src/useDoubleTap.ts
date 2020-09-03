import { useCallback, useRef } from 'react';

export default function useDoubleTap<T>(
  handler: React.TouchEventHandler<T>,
  delay = 300,
  deps: React.DependencyList = []
): React.TouchEventHandler<T> {
  const lastTapTimeRef = useRef(0);

  return useCallback<React.TouchEventHandler<T>>((event) => {
    const currentTapTime = Date.now();
    const tapLength = currentTapTime - lastTapTimeRef.current;

    if (tapLength > 0 && tapLength <= delay) {
      lastTapTimeRef.current = 0;
      handler(event);
    } else {
      lastTapTimeRef.current = currentTapTime;
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
