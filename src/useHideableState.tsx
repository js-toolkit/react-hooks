import React, { useCallback, useLayoutEffect, useMemo } from 'react';
import useIsFirstMount from './useIsFirstMount';
import useRefCallback from './useRefCallback';
import useUpdateState from './useUpdateState';

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
  const [getState, setState] = useUpdateState(state);
  const isFirstMount = useIsFirstMount();

  useLayoutEffect(() => {
    !isFirstMount() && setState(state);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, updateStateDeps);

  const show = useCallback(() => {
    if (getState().visible) return;
    setState((prev) => ({ ...prev, visible: true }));
  }, [getState, setState]);

  const hide = useCallback(() => {
    if (!getState().visible) return;
    setState((prev) => ({ ...prev, visible: false }));
  }, [getState, setState]);

  const disable = useRefCallback(() => {
    const { enabled, visible } = getState();
    if (!enabled && !visible) return;
    setState((prev) => ({ ...prev, enabled: false, visible: false }));
  });

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
