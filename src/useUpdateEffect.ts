import React, { useEffect } from 'react';
import useFirstMount from './useFirstMount';

export default function useUpdateEffect(
  effect: React.EffectCallback,
  deps?: React.DependencyList
): void {
  const firstMount = useFirstMount();

  // eslint-disable-next-line consistent-return
  return useEffect(() => {
    if (!firstMount) return effect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
