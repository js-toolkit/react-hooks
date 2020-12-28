import { useCallback, useEffect, useMemo, useRef } from 'react';
import debounce, { DebouncedFunc } from '@vzh/ts-utils/debounce';
import useStateChange from './useStateChange';

export interface ActivateOptions {
  force?: boolean;
  noWait?: boolean;
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
   * Time in milliseconds after which an active set to false.
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
  const [isActive, , setActive] = useStateChange(!!initialValue);
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const deactivateDebounced = useMemo(() => {
    return debounce(() => isActive() && setActive(false), wait);
  }, [isActive, setActive, wait]);

  const activate = useCallback(
    (options: ActivateOptions | boolean = {}) => {
      const { force, noWait } =
        typeof options === 'boolean' ? { force: options, noWait: false } : options;
      if (disabledRef.current && !force) {
        return;
      }
      if (!isActive()) {
        setActive(true);
      }
      // Do not debounce if disabled
      if (wait <= 0 || noWait) {
        deactivateDebounced.cancel();
        return;
      }
      deactivateDebounced();
    },
    [deactivateDebounced, isActive, setActive, wait]
  );

  const deactivate = useCallback(() => {
    deactivateDebounced.cancel();
    if (isActive()) {
      setActive(false);
    }
  }, [deactivateDebounced, isActive, setActive]);

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
