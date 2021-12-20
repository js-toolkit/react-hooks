import React, { useMemo } from 'react';
import useRefState from './useRefState';

export default function useUpdatedRefState<S = undefined>(
  state?: undefined,
  updateStateDeps?: React.DependencyList
): [getState: () => S | undefined, setState: React.Dispatch<React.SetStateAction<S | undefined>>];

export default function useUpdatedRefState<S>(
  state: S | ((prevState?: S) => S),
  updateStateDeps?: React.DependencyList
): [getState: () => S, setState: React.Dispatch<React.SetStateAction<S>>];

export default function useUpdatedRefState<S>(
  state?: S | ((prevState?: S) => S),
  updateStateDeps: React.DependencyList = []
): [getState: () => S | undefined, setState: React.Dispatch<React.SetStateAction<S | undefined>>] {
  const [getState, setState] = useRefState<S>();

  // Update RefState during render
  useMemo(() => {
    setState(state, { silent: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, updateStateDeps);

  return [getState, setState];
}
