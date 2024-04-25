import React, { useCallback, useRef } from 'react';
import useFirstMount from './useFirstMount';
import useUpdate from './useUpdate';

export interface SetRefStateOptions {
  /** Do not re-render after state set. Defaults to false. */
  readonly silent?: boolean;
  /** Force update react state. Ignored when silent is `true`. Defaults to false. */
  readonly force?: boolean;
}

export type UpdateState<S> = (
  patch: IfExtends<
    S,
    ReadonlyArray<unknown> | AnyFunction,
    S,
    IfExtends<S, AnyObject, Partial<S>, S>
  >,
  options?: SetRefStateOptions
) => void;

export default function useRefState<S = undefined>(): [
  getState: () => S | undefined,
  setState: (nextState: React.SetStateAction<S | undefined>, options?: SetRefStateOptions) => void,
  patch: UpdateState<S | undefined>,
];

export default function useRefState<S>(
  initialState: S | (() => S)
): [
  getState: () => S,
  setState: (nextState: React.SetStateAction<S>, options?: SetRefStateOptions) => void,
  patch: UpdateState<S>,
];

// export default function useRefState<S>(
//   state: S | ((prev: S | undefined) => S),
//   updateStateDeps: React.DependencyList
// ): [
//   getState: () => S,
//   setState: (nextState: React.SetStateAction<S>, options?: SetRefStateOptions) => void,
//   patch: UpdateState<S>
// ];

export default function useRefState<S>(
  initialState?: S | (() => S)
  // updateStateDeps: React.DependencyList = []
): [
  getState: () => S | undefined,
  setState: (nextState: React.SetStateAction<S | undefined>, options?: SetRefStateOptions) => void,
  patch: UpdateState<S | undefined>,
] {
  const update = useUpdate();
  const firstMount = useFirstMount();
  const stateRef = useRef<S | undefined>();

  if (firstMount) {
    stateRef.current =
      (typeof initialState === 'object' && Array.isArray(initialState) && initialState) ||
      (typeof initialState === 'object' && initialState !== null && { ...initialState }) ||
      (typeof initialState === 'function' ? (initialState as () => S)() : initialState);
  }

  const getState = useCallback(() => stateRef.current, []);

  const setState = useCallback(
    (state: React.SetStateAction<S | undefined>, { silent, force }: SetRefStateOptions = {}) => {
      const nextState =
        typeof state === 'function'
          ? (state as React.ReducerWithoutAction<S | undefined>)(stateRef.current)
          : state;
      const shouldUpdate = force || stateRef.current !== nextState;
      stateRef.current = nextState;
      shouldUpdate && !silent && update();
    },
    [update]
  );

  const patchState = useCallback(
    (patch: Partial<S | undefined>, { silent, force }: SetRefStateOptions = {}) => {
      const shouldUpdate = force || stateRef.current !== patch;
      if (patch != null && Array.isArray(patch)) {
        stateRef.current = patch as S;
      } else if (patch != null && typeof patch === 'object') {
        Object.assign(stateRef.current as AnyObject, patch);
      } else {
        stateRef.current = patch;
      }
      shouldUpdate && !silent && update();
    },
    [update]
  );

  // // Update RefState during render
  // useMemo(() => {
  //   const nextState =
  //     (typeof initialState === 'object' && initialState !== null && { ...initialState }) ||
  //     initialState;
  //   setState(nextState, { silent: true });
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, updateStateDeps);

  return [getState, setState, patchState];
}
