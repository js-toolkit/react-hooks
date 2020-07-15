import { useCallback } from 'react';

export default function useSetRefs<T>(
  ...refs: readonly (React.Ref<T> | undefined)[]
): React.RefCallback<T> {
  const setRefs = useCallback<React.RefCallback<T>>(
    (el) => {
      refs.forEach((r) => {
        if (typeof r === 'function') {
          r(el);
        } else if (r) {
          // eslint-disable-next-line no-param-reassign
          (r as React.MutableRefObject<T | null>).current = el;
        }
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );

  return setRefs;
}
