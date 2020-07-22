import { useCallback, useRef, useEffect } from 'react';
import useStateChange from './useStateChange';

export type UseActiveResult = [boolean, () => void, () => void];

export default function useActive(timeout = 3000): UseActiveResult {
  const [getActive, , setActive] = useStateChange(false);
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
    cancelTimer();
    timerRef.current = window.setTimeout(() => setActive(false), timeout);
  }, [cancelTimer, getActive, setActive, timeout]);

  useEffect(() => () => cancelTimer(), [cancelTimer]);

  return [getActive(), update, cancel];
}
