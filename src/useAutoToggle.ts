import { useCallback, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import useStateChange from './useStateChange';

/** [getActive(), setActive(), cancel()] */
export type UseAutoToggleResult = [() => boolean, () => void, () => void];

export interface UseAutoToggleProps {
  initialValue?: boolean;
  /**
   * Time in milliseconds after which an active set to false.
   * If <= 0 then timer creation is disabled.
   */
  wait?: number;
}

/** Useful for tracking user interaction. */
export default function useAutoToggle({
  initialValue,
  wait = 3000,
}: UseAutoToggleProps = {}): UseAutoToggleResult {
  const [getActive, , setActive] = useStateChange(!!initialValue);

  const deactivateDebounced = useMemo(() => {
    return debounce(() => setActive(false), wait);
  }, [setActive, wait]);

  const activate = useCallback(() => {
    if (!getActive()) {
      setActive(true);
    }
    // Do not debounce if disabled
    if (wait <= 0) {
      return;
    }
    deactivateDebounced();
  }, [deactivateDebounced, getActive, setActive, wait]);

  useEffect(() => {
    if (wait <= 0) {
      deactivateDebounced.cancel();
    }
    if (initialValue && !getActive()) {
      setActive(true);
    } else if (!initialValue && getActive()) {
      setActive(false);
    }
  }, [activate, deactivateDebounced, getActive, initialValue, setActive, wait]);

  useEffect(() => () => deactivateDebounced.cancel(), [deactivateDebounced]);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  return [getActive, activate, deactivateDebounced.cancel];
}
