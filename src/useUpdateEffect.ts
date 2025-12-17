import { useEffect } from 'react';
import useIsFirstMount from './useIsFirstMount';

export default function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  const isFirstMount = useIsFirstMount();

  // eslint-disable-next-line consistent-return
  return useEffect(() => {
    if (!isFirstMount()) return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
