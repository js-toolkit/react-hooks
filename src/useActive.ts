import { useCallback, useRef, useEffect } from 'react';
import useStateChange from './useStateChange';

export type UseActiveResult = [boolean, () => void, () => void];

export interface UseActiveProps {
  initialValue?: boolean;
  disabled?: boolean;
  timeout: number;
}

export default function useActive({
  initialValue,
  disabled,
  timeout = 3000,
}: UseActiveProps): UseActiveResult {
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
    if (disabled) {
      return;
    }
    if (!getActive()) {
      setActive(true);
    }
    cancelTimer();
    timerRef.current = window.setTimeout(() => setActive(false), timeout);
  }, [cancelTimer, disabled, getActive, setActive, timeout]);

  useEffect(() => {
    if (disabled) {
      cancel();
      return;
    }
    if (initialValue && !getActive()) {
      update();
    } else if (!initialValue && getActive()) {
      cancel();
    }
  }, [cancel, disabled, getActive, initialValue, update]);

  useEffect(() => () => cancelTimer(), [cancelTimer]);

  return [getActive(), update, cancel];
}
