import { useCallback, useRef } from 'react';
import useUpdate from './useUpdate';

type UpdateState<S> = (
  patch: IfExtends<
    S,
    ReadonlyArray<unknown> | AnyFunction,
    S,
    IfExtends<S, AnyObject, Partial<S>, S>
  >
) => void;

export default function useRefState<S>(
  initialState: S
): [getState: () => S, updateState: UpdateState<S>] {
  const update = useUpdate();

  const stateRef = useRef<S>(
    typeof initialState === 'object' && initialState !== null ? { ...initialState } : initialState
  );

  const get = useCallback(() => stateRef.current, []);

  const set = useCallback(
    (patch: Partial<S>) => {
      if (patch != null && typeof patch === 'object') {
        Object.assign(stateRef.current, patch);
      } else {
        stateRef.current = patch;
      }
      update();
    },
    [update]
  );

  return [get, set];
}
