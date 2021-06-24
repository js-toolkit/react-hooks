import React, { useCallback, useMemo } from 'react';
import useUpdatedState from './useUpdatedState';

export interface HideableState {
  readonly enabled: boolean;
  readonly visible: boolean;
}

export type UseHideableStateResult = HideableState & {
  show: VoidFunction;
  hide: VoidFunction;
  disable: VoidFunction;
};

export default function useHideableState(
  state: HideableState | ((prevState?: HideableState) => HideableState),
  updateStateDeps: React.DependencyList = []
): UseHideableStateResult {
  const [getState, setState] = useUpdatedState(state, updateStateDeps);

  const show = useCallback(() => {
    if (getState().visible) return;
    setState((prev) => ({ ...prev, visible: true }));
  }, [getState, setState]);

  const hide = useCallback(() => {
    if (!getState().visible) return;
    setState((prev) => ({ ...prev, visible: false }));
  }, [getState, setState]);

  const disable = useCallback(() => {
    const { enabled, visible } = getState();
    if (!enabled && !visible) return;
    setState((prev) => ({ ...prev, enabled: false, visible: false }));
  }, [getState, setState]);

  return useMemo(
    () => ({
      get enabled() {
        return getState().enabled;
      },
      get visible() {
        return getState().visible;
      },
      show,
      hide,
      disable,
    }),
    [disable, getState, hide, show]
  );
}
