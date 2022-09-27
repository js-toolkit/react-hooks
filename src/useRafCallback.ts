import { useCallback, useEffect, useRef } from 'react';

export default function useRafCallback<T extends AnyFunction>(
  callback: T,
  deps: React.DependencyList
): T {
  const frameRef = useRef(0);

  useEffect(() => () => cancelAnimationFrame(frameRef.current), []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  return useCallback(
    ((...args: unknown[]) => {
      frameRef.current = requestAnimationFrame(() => {
        callback(...args);
      });
    }) as T,
    deps
  );
}
