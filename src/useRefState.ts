import React, { useCallback, useRef } from 'react';
import useUpdate from './useUpdate';

interface SetRefStateOptions {
  /** Do not re-render after state set. */
  slient?: boolean;
}

type UpdateState<S> = (
  patch: IfExtends<
    S,
    ReadonlyArray<unknown> | AnyFunction,
    S,
    IfExtends<S, AnyObject, Partial<S>, S>
  >,
  options?: SetRefStateOptions
) => void;

export default function useRefState<S>(
  initialState: S | (() => S)
): [
  getState: () => S,
  setState: (state: React.SetStateAction<S>, options?: SetRefStateOptions) => void,
  patch: UpdateState<S>
] {
  const update = useUpdate();

  const stateRef = useRef<S>(
    (typeof initialState === 'object' && initialState !== null && { ...initialState }) ||
      typeof initialState === 'function'
      ? (initialState as () => S)()
      : initialState
  );

  const getState = useCallback(() => stateRef.current, []);

  const setState = useCallback(
    (state: React.SetStateAction<S>, { slient }: SetRefStateOptions = {}) => {
      stateRef.current =
        typeof state === 'function'
          ? (state as React.ReducerWithoutAction<S>)(stateRef.current)
          : state;
      !slient && update();
    },
    [update]
  );

  const patchState = useCallback(
    (patch: Partial<S>, { slient }: SetRefStateOptions = {}) => {
      if (patch != null && typeof patch === 'object') {
        Object.assign(stateRef.current, patch);
      } else {
        stateRef.current = patch;
      }
      !slient && update();
    },
    [update]
  );

  return [getState, setState, patchState];
}
