import React, { useLayoutEffect } from 'react';
import useIsFirstMount from './useIsFirstMount';
import useUpdateState from './useUpdateState';

export default function useUpdatedState<S>(
  state: S | ((prevState?: S) => S),
  updateStateDeps: React.DependencyList = []
): [getState: () => S, setState: React.Dispatch<React.SetStateAction<S>>] {
  const [getState, setState] = useUpdateState(state);
  const isFirstMount = useIsFirstMount();

  useLayoutEffect(() => {
    !isFirstMount() && setState(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, updateStateDeps);

  return [getState, setState];
}
