import { useCallback, useEffect, useMemo } from 'react';
import debounce from 'lodash.debounce';
import useStateChange from './useStateChange';

/** [getActive(), getData(), set(boolean, Data), updateData(Data) cancel()] */
export type UseToggleDebounceResult<D> = [
  () => boolean,
  () => D,
  (isActive: boolean, data: D) => void,
  (data: D) => void,
  () => void
];

export type UseToggleDebounceProps<D> = {
  initialValue?: boolean;
  /** Time in milliseconds after which an active set to false. */
  wait?: number;
} & (undefined extends D ? { initialData?: D } : { initialData: D });

// type A<T = undefined> = undefined extends T ? string : boolean;
// const v: number | string | undefined = 0 as number | string | undefined;
// type B = A<typeof v>;
// const v: number | string | undefined = 0;
// const [a, d] = useToggleDebounce({ initialData: v });
// const [a, d] = useToggleDebounce({});

export default function useToggleDebounce<D = undefined>(
  {
    initialValue,
    initialData,
    wait = 1000,
  }: UseToggleDebounceProps<D> = {} as UseToggleDebounceProps<D>
): UseToggleDebounceResult<D> {
  const [getState, , setState] = useStateChange({ isActive: !!initialValue, data: initialData });

  const activateDebounced = useMemo(() => {
    return debounce((data: D) => setState({ isActive: true, data }), wait);
  }, [setState, wait]);

  const set = useCallback(
    (value: boolean, data: D) => {
      if (!value) {
        activateDebounced.cancel();
        setState({ isActive: false, data });
        return;
      }
      activateDebounced(data);
    },
    [activateDebounced, setState]
  );

  useEffect(() => {
    if (wait <= 0) {
      activateDebounced.cancel();
    }
    if (initialValue && !getState()) {
      setState({ isActive: true, data: initialData });
    } else if (!initialValue && getState()) {
      setState({ isActive: false, data: initialData });
    }
  }, [activateDebounced, getState, initialData, initialValue, setState, wait]);

  useEffect(() => () => activateDebounced.cancel(), [activateDebounced]);

  const getActive = useCallback(() => getState().isActive, [getState]);
  const getData = useCallback(() => getState().data as D, [getState]);
  const setData = useCallback((data: D) => setState((prev) => ({ ...prev, data })), [setState]);

  // eslint-disable-next-line @typescript-eslint/unbound-method
  return [getActive, getData, set, setData, activateDebounced.cancel];
}
