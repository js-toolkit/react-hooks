import React, { useMemo } from 'react';
import useRefState from './useRefState';

export default function useUpdatedRefState<S>(
  state: S | ((prevState?: S) => S),
  updateStateDeps: React.DependencyList = []
): [getState: () => S, setState: React.Dispatch<React.SetStateAction<S>>] {
  const [getState, setState] = useRefState<S>(undefined as unknown as S);

  // Update RefState during render
  useMemo(() => {
    setState(state, { slient: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, updateStateDeps);

  return [getState, setState];
}
