import React, { useCallback, useRef } from 'react';
import useFirstMount from './useFirstMount';
import useUpdate from './useUpdate';

interface SetRefStateOptions {
  /** Do not re-render after state set. */
  silent?: boolean;
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

export default function useRefState<S = undefined>(): [
  getState: () => S | undefined,
  setState: (nextState: React.SetStateAction<S | undefined>, options?: SetRefStateOptions) => void,
  patch: UpdateState<S | undefined>
];

export default function useRefState<S>(
  initialState: S | (() => S)
): [
  getState: () => S,
  setState: (nextState: React.SetStateAction<S>, options?: SetRefStateOptions) => void,
  patch: UpdateState<S>
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
  patch: UpdateState<S | undefined>
] {
  const update = useUpdate();
  const firstMount = useFirstMount();
  const stateRef = useRef<S | undefined>();

  if (firstMount) {
    stateRef.current =
      (typeof initialState === 'object' && initialState !== null && { ...initialState }) ||
      (typeof initialState === 'function' ? (initialState as () => S)() : initialState);
  }

  const getState = useCallback(() => stateRef.current, []);

  const setState = useCallback(
    (state: React.SetStateAction<S | undefined>, { silent }: SetRefStateOptions = {}) => {
      stateRef.current =
        typeof state === 'function'
          ? (state as React.ReducerWithoutAction<S | undefined>)(stateRef.current)
          : state;
      !silent && update();
    },
    [update]
  );

  const patchState = useCallback(
    (patch: Partial<S | undefined>, { silent }: SetRefStateOptions = {}) => {
      if (patch != null && typeof patch === 'object') {
        Object.assign(stateRef.current, patch);
      } else {
        stateRef.current = patch;
      }
      !silent && update();
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
