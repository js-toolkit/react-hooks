import React, { useCallback, useRef } from 'react';
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
): [getState: () => S, setState: React.Dispatch<React.SetStateAction<S>>, patch: UpdateState<S>] {
  const update = useUpdate();

  const stateRef = useRef<S>(
    typeof initialState === 'object' && initialState !== null ? { ...initialState } : initialState
  );

  const getState = useCallback(() => stateRef.current, []);

  const setState = useCallback(
    (state: React.SetStateAction<S>) => {
      stateRef.current =
        typeof state === 'function'
          ? (state as React.ReducerWithoutAction<S>)(stateRef.current)
          : state;
      update();
    },
    [update]
  );

  const patchState = useCallback(
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

  return [getState, setState, patchState];
}
