import { useEffect, useMemo } from 'react';
import debounce, { DebouncedFunc } from '@js-toolkit/utils/debounce';
import useRefState from './useRefState';
import useRefCallback from './useRefCallback';

export interface ActivateOptions {
  /** Ignore disabled option. */
  force?: boolean;
  /** Disable auto toggle. */
  noWait?: boolean;
  /** Force update react state. */
  forceUpdateState?: boolean;
}

export interface Activate {
  (options: ActivateOptions): void;
  (force: boolean): void;
  (): void;
}

/** [isActive(), activate(), deactivate(), debounced] */
export type UseAutoToggleResult = [
  isActive: () => boolean,
  activate: Activate,
  deactivate: () => void,
  debounced: DebouncedFunc<VoidFunction>
];

export interface UseAutoToggleProps {
  initialValue?: boolean;
  disabled?: boolean;
  /**
   * Time in milliseconds after which an active state set to false.
   * If <= 0 then timer creation is disabled.
   */
  wait?: number;
}

/** Useful for tracking user interaction. */
export default function useAutoToggle({
  initialValue,
  disabled,
  wait = 3000,
}: UseAutoToggleProps = {}): UseAutoToggleResult {
  const [isActive, setActive] = useRefState(!!initialValue);

  const deactivateDebounced = useMemo(() => {
    return debounce(() => isActive() && setActive(false), wait);
  }, [isActive, setActive, wait]);

  const activate = useRefCallback((options: ActivateOptions | boolean = {}) => {
    const { force, noWait, forceUpdateState } =
      typeof options === 'boolean' ? ({ force: options } as ActivateOptions) : options;
    if (disabled && !force) {
      return;
    }
    if (forceUpdateState || !isActive()) {
      setActive(true);
    }
    // Do not debounce if disabled
    if (wait <= 0 || noWait) {
      deactivateDebounced.cancel();
      return;
    }
    deactivateDebounced();
  });

  const deactivate = useRefCallback(() => {
    deactivateDebounced.cancel();
    if (isActive()) {
      setActive(false);
    }
  });

  useEffect(() => {
    if (initialValue && !disabled) {
      activate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Deactivate early if disabled changed to `true`
  useEffect(
    () => () => {
      !disabled && deactivate();
    },
    [deactivate, disabled]
  );

  // Cancel early if wait changed or unmount
  useEffect(() => () => deactivateDebounced.cancel(), [deactivateDebounced]);

  return [isActive, activate, deactivate, deactivateDebounced];
}
