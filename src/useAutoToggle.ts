import { useCallback, useEffect, useMemo } from 'react';
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
  value?: boolean;
  /**
   * Time in milliseconds after which an active set to false.
   * If <= 0 then timer creation is disabled.
   */
  wait?: number;
}

/** Useful for tracking user interaction. */
export default function useAutoToggle({
  value: valueProp,
  wait = 3000,
}: UseAutoToggleProps = {}): UseAutoToggleResult {
  const [getActive, , setActive] = useStateChange(!!valueProp);

  const deactivateDebounced = useMemo(() => debounce(() => setActive(false), wait), [
    setActive,
    wait,
  ]);

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

  const deactivate = useCallback(() => {
    deactivateDebounced.cancel();
    if (getActive()) {
      setActive(false);
    }
  }, [deactivateDebounced, getActive, setActive]);

  useEffect(() => {
    if (wait <= 0) {
      deactivateDebounced.cancel();
    }
    if (valueProp && !getActive()) {
      setActive(true);
    } else if (!valueProp && getActive()) {
      setActive(false);
    }
  }, [activate, deactivateDebounced, getActive, valueProp, setActive, wait]);

  useEffect(() => () => deactivateDebounced.cancel(), [deactivateDebounced]);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  return [getActive, activate, deactivate, deactivateDebounced.cancel];
}
