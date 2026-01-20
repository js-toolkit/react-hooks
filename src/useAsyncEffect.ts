import { useEffect } from 'react';

export function useAsyncEffect(effect: VoidFunction, deps?: React.DependencyList): void {
  useEffect(() => {
    const timer = setTimeout(effect, 0);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
