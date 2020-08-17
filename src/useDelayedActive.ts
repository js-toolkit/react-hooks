import { useCallback, useEffect, useRef } from 'react';
import useStateChange from './useStateChange';

/** [state, set(boolean, Data), updateData(Data) cancel()] */
export type UseDelayedActiveResult<D> = [
  // undefined extends D ? { isActive: boolean; data?: D } : { isActive: boolean; data: D },
  boolean,
  D,
  (isActive: boolean, data: D) => void,
  (data: D) => void,
  () => void
];

// export interface UseDelayedActiveProps<D> {
//   initialValue?: boolean;
//   initialData: D;
//   /** Time in milliseconds after which to consider use idle. */
//   delay?: number;
// }

export type UseDelayedActiveProps<D> = {
  initialValue?: boolean;
  /** Time in milliseconds after which to consider use idle. */
  delay?: number;
} & (undefined extends D ? { initialData?: D } : { initialData: D });

// type A<T = undefined> = undefined extends T ? string : boolean;
// const v: number | string | undefined = 0 as number | string | undefined;
// type B = A<typeof v>;
// const v: number | string | undefined = 0;
// const [a, d] = useDelayedActive({ initialData: v });
// const [a, d] = useDelayedActive({});

export default function useDelayedActive<D = undefined>(
  {
    initialValue,
    initialData,
    delay = 1000,
  }: UseDelayedActiveProps<D> = {} as UseDelayedActiveProps<D>
): UseDelayedActiveResult<D> {
  const [getState, , setState] = useStateChange({ isActive: !!initialValue, data: initialData });
  const timerRef = useRef(0);

  const cancelTimer = useCallback(() => window.clearTimeout(timerRef.current), []);

  const setData = useCallback((data: D) => setState((prev) => ({ ...prev, data })), [setState]);

  const set = useCallback(
    (value: boolean, data: D) => {
      // Just update data
      // if (value === getState().isActive) {
      //   setState({ isActive: value, data });
      //   return;
      // }

      cancelTimer();

      if (!value) {
        setState({ isActive: false, data });
        return;
      }

      // Do not set timer if disabled
      if (delay <= 0) {
        setState({ isActive: true, data });
        return;
      }

      timerRef.current = window.setTimeout(() => setState({ isActive: true, data }), delay);
    },
    [cancelTimer, delay, setState]
  );

  useEffect(() => {
    if (initialValue && !getState()) {
      setState({ isActive: true, data: initialData });
    } else if (!initialValue && getState()) {
      setState({ isActive: false, data: initialData });
    }
  }, [getState, initialData, initialValue, set, setState]);

  useEffect(() => () => cancelTimer(), [cancelTimer]);

  // return [getState(), set, cancelTimer];
  const { isActive, data } = getState();
  return [isActive, data as D, set, setData, cancelTimer];
}
