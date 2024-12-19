import { useCallback, useMemo } from 'react';
import useUpdatedRefState from './useUpdatedRefState';

export interface HideableState {
  readonly enabled: boolean;
  readonly visible: boolean;
}

export type UseHideableStateResult = HideableState & {
  readonly hidden: boolean;
  show: VoidFunction;
  hide: VoidFunction;
  disable: VoidFunction;
  getState: () => HideableState;
};

export default function useHideableState(
  state: HideableState | ((prevState?: HideableState) => HideableState),
  updateStateDeps: React.DependencyList = []
): UseHideableStateResult {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [getState, setState] = useUpdatedRefState(state, updateStateDeps);

  const show = useCallback(() => {
    if (getState().visible) return;
    setState((prev) => ({ ...prev, enabled: true, visible: true }));
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
      get hidden() {
        return !getState().visible;
      },
      show,
      hide,
      disable,
      getState,
    }),
    [disable, getState, hide, show]
  );
}
