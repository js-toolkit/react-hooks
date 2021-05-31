import React, { useCallback, useEffect, useMemo } from 'react';
import useFirstRender from './useFirstRender';
import useUpdateState from './useUpdateState';

export interface HideableState {
  readonly enabled: boolean;
  readonly visible: boolean;
}

export type UseHideableStateProps = HideableState;

export type UseHideableStateResult = HideableState & { hide: VoidFunction; disable: VoidFunction };

export default function useHideableState(
  initialState: HideableState | (() => HideableState),
  updateState?: (prevState: HideableState) => HideableState,
  updateStateDeps: React.DependencyList = []
): UseHideableStateResult {
  const [getState, setState] = useUpdateState(initialState);
  const firstRender = useFirstRender();

  useEffect(() => {
    !firstRender && updateState && setState(updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, updateStateDeps);

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
      hide,
      disable,
    }),
    [disable, getState, hide]
  );
}
