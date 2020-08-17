import { useCallback, useRef, useEffect } from 'react';
import useStateChange from './useStateChange';

/** [isActive, update(), cancel()] */
export type UseActiveResult = [boolean, () => void, () => void];

export interface UseActiveProps {
  initialValue?: boolean;
  /**
   * Time in milliseconds after which to consider use idle.
   * If <= 0 then timer creation is disabled.
   */
  timeout?: number;
}

/** Useful for tracking user interaction. */
export default function useActive({
  initialValue,
  timeout = 3000,
}: UseActiveProps = {}): UseActiveResult {
  const [getActive, , setActive] = useStateChange(!!initialValue);
  const timerRef = useRef(0);

  const cancelTimer = useCallback(() => window.clearTimeout(timerRef.current), []);

  const cancel = useCallback(() => {
    if (getActive()) {
      setActive(false);
    }
    cancelTimer();
  }, [cancelTimer, getActive, setActive]);

  const update = useCallback(() => {
    if (!getActive()) {
      setActive(true);
    }
    // Do not set timer if disabled
    if (timeout <= 0) {
      return;
    }
    cancelTimer();
    timerRef.current = window.setTimeout(() => setActive(false), timeout);
  }, [cancelTimer, getActive, setActive, timeout]);

  useEffect(() => {
    if (timeout <= 0) {
      cancel();
      return;
    }
    if (initialValue && !getActive()) {
      update();
    } else if (!initialValue && getActive()) {
      cancel();
    }
  }, [cancel, getActive, initialValue, timeout, update]);

  useEffect(() => () => cancelTimer(), [cancelTimer]);

  return [getActive(), update, cancel];
}
