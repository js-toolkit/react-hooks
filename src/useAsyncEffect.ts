import React from 'react';

export default function useAsyncEffect(effect: VoidFunction, deps?: React.DependencyList): void {
  React.useEffect(() => {
    const timer = setTimeout(effect, 0);
    return () => {
      clearTimeout(timer);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);
}
