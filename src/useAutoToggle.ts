import { useCallback, useEffect, useMemo, useRef } from 'react';
import debounce from 'lodash.debounce';
import useStateChange from './useStateChange';

/** [getActive(), setActive(), stopActive(), cancel()] */
export type UseAutoToggleResult = [
  getActive: () => boolean,
  setActive: () => void,
  stopActive: () => void,
  cancel: () => void
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
  const [getActive, , setActive] = useStateChange(!!initialValue);
  const waitRef = useRef(wait);
  waitRef.current = wait;
  const disabledRef = useRef(disabled);
  disabledRef.current = disabled;

  const deactivateDebounced = useMemo(() => debounce(() => setActive(false), waitRef.current), [
    setActive,
  ]);

  const activate = useCallback(() => {
    if (disabledRef.current) return;
    if (!getActive()) {
      setActive(true);
    }
    // Do not debounce if disabled
    if (waitRef.current <= 0) {
      return;
    }
    deactivateDebounced();
  }, [deactivateDebounced, getActive, setActive]);

  const deactivate = useCallback(() => {
    deactivateDebounced.cancel();
    if (getActive()) {
      setActive(false);
    }
  }, [deactivateDebounced, getActive, setActive]);

  useEffect(() => {
    if (initialValue) {
      activate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (disabled) {
      deactivate();
    }
  }, [deactivate, disabled]);

  useEffect(() => {
    if (wait <= 0) {
      deactivateDebounced.cancel();
    }
  }, [deactivateDebounced, wait]);

  useEffect(() => () => deactivateDebounced.cancel(), [deactivateDebounced]);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  return [getActive, activate, deactivate, deactivateDebounced.cancel];
}
