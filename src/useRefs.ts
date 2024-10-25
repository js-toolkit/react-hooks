/* eslint-disable @typescript-eslint/no-unused-expressions */
import { useCallback } from 'react';

export default function useRefs<T>(
  ...args: [
    refs: readonly (React.Ref<T> | undefined)[],
    onMount?: (instance: T) => void,
    onUnmount?: VoidFunction,
  ]
): React.RefCallback<T>;

export default function useRefs<T>(...refs: (React.Ref<T> | undefined)[]): React.RefCallback<T>;

export default function useRefs<T>(
  ...args:
    | readonly (React.Ref<T> | undefined)[]
    | [
        refs: readonly (React.Ref<T> | undefined)[],
        onMount?: (instance: T) => void,
        onUnmount?: VoidFunction,
      ]
): React.RefCallback<T> {
  const withCallbacks = Array.isArray(args[0]);
  // const onMount = withCallbacks ? [args[1] as VoidFunction] : undefined;
  // const onUnmount = withCallbacks ? [args[2] as VoidFunction] : undefined;
  const [refs, onMount, onUnmount] = withCallbacks
    ? [
        args[0] as (React.Ref<T> | undefined)[],
        args[1] as (instance: T) => void,
        args[2] as VoidFunction,
      ]
    : [args];

  return useCallback<React.RefCallback<T>>(
    (instance) => {
      refs.forEach((r) => {
        if (typeof r === 'function') {
          (r as React.RefCallback<T>)(instance);
        } else if (r) {
          (r as React.MutableRefObject<T | null>).current = instance;
        }
      });
      if (instance == null) onUnmount && onUnmount();
      else onMount && onMount(instance);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    refs
  );
}
