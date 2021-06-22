import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import useIsFirstMount from './useIsFirstMount';
import useUpdateState from './useUpdateState';

export interface HideableState {
  readonly enabled: boolean;
  readonly visible: boolean;
}

export type UseHideableStateResult = HideableState & { hide: VoidFunction; disable: VoidFunction };

function useHideableState(
  state: HideableState | ((prevState?: HideableState) => HideableState),
  updateStateDeps?: React.DependencyList
): UseHideableStateResult;

function useHideableState(
  initialState: HideableState | (() => HideableState),
  updateState: (prevState: HideableState) => HideableState,
  updateStateDeps: React.DependencyList
): UseHideableStateResult;

function useHideableState(
  initialState: HideableState | (() => HideableState),
  updateStateOrDeps?: ((prevState: HideableState) => HideableState) | React.DependencyList,
  updateStateDeps?: React.DependencyList
): UseHideableStateResult {
  const [getState, setState] = useUpdateState(initialState);
  const isFirstMount = useIsFirstMount();

  const deps = Array.isArray(updateStateOrDeps) ? updateStateOrDeps : updateStateDeps ?? [];
  const updateState = typeof updateStateOrDeps === 'function' ? updateStateOrDeps : initialState;

  useLayoutEffect(() => {
    !isFirstMount() && setState(updateState);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, deps);

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

export default useHideableState;
