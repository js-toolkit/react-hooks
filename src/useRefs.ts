import { useCallback } from 'react';

export default function useRefs<T>(
  refs: readonly (React.Ref<T> | undefined)[],
  onMount?: VoidFunction,
  onUnmount?: VoidFunction
): React.RefCallback<T>;

export default function useRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T>;

export default function useRefs<T>(
  ...args:
    | (React.Ref<T> | undefined)[]
    | [readonly (React.Ref<T> | undefined)[], VoidFunction?, VoidFunction?]
): React.RefCallback<T> {
  const withCallbacks = Array.isArray(args[0]);
  // const onMount = withCallbacks ? [args[1] as VoidFunction] : undefined;
  // const onUnmount = withCallbacks ? [args[2] as VoidFunction] : undefined;
  const [onMount, onUnmount] = withCallbacks
    ? [args[1] as VoidFunction, args[2] as VoidFunction]
    : [];

  const refs = (withCallbacks ? args[0] : args) as (React.Ref<T> | undefined)[];

  return useCallback<React.RefCallback<T>>(
    (el) => {
      refs.forEach((r) => {
        if (typeof r === 'function') {
          r(el);
        } else if (r) {
          // eslint-disable-next-line no-param-reassign
          (r as React.MutableRefObject<T | null>).current = el;
        }
      });
      if (el == null) onUnmount && onUnmount();
      else onMount && onMount();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
