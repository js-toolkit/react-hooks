import React, { useRef } from 'react';
import useIsFirstMount from './useIsFirstMount';
import useUpdatedState from './useUpdatedState';

interface ExtendFactory<S, T> {
  (state: { get: () => S; set: React.Dispatch<React.SetStateAction<S>> }): T;
}

export default function useExtendedState<S, E>(
  state: S | ((prevState?: S) => S),
  extend: ExtendFactory<S, E>,
  updateStateDeps: React.DependencyList = []
): [getState: () => S, setState: React.Dispatch<React.SetStateAction<S>>, extended: E] {
  const [getState, setState] = useUpdatedState(state, updateStateDeps);
  const isFirstMount = useIsFirstMount();

  const extended = useRef<E>(undefined as unknown as E);
  if (extend && isFirstMount()) {
    extended.current = extend({ get: getState, set: setState });
  }

  return [getState, setState, extended.current];
}
