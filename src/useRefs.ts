import type React from 'react';
import useRefCallback from './useRefCallback';

export default function useRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T> {
  return useRefCallback<React.RefCallback<T>>((instance) => {
    const unmounts = new Array<VoidFunction>(refs.length);
    refs.forEach((r, i) => {
      if (typeof r === 'function') {
        const unmount = r(instance as T);
        unmounts[i] = typeof unmount === 'function' ? unmount : () => r(null);
      } else if (r) {
        r.current = instance;
        unmounts[i] = () => {
          r.current = null;
        };
      }
    });
    return () => {
      unmounts.forEach((unmount) => unmount());
    };
  });
}
