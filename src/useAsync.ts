/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-return */
import { useCallback, useEffect, useMemo, useRef } from 'react';
import useIsMounted from './useIsMounted';
import useRefState from './useRefState';

type AsyncState<T> =
  | {
      loading: true;
      error?: unknown;
      value?: T;
    }
  | {
      loading: false;
      error: unknown;
      value?: undefined;
    }
  | {
      loading: false;
      error?: undefined;
      value: T;
    };

type StateByAsyncFn<F extends AnyAsyncFunction> = ReturnType<F> extends Promise<infer T>
  ? AsyncState<T>
  : AsyncState<unknown>;

export type UseAsyncProps<F extends AnyAsyncFunction> = Partial<StateByAsyncFn<F>> & {
  loading?: Parameters<F> | boolean;
  fn: F;
  /** Called when the `deps` changes or the component is unmount. */
  onUnmount?: (state: StateByAsyncFn<F>) => void;
};

type UseAsyncResult<F extends AnyAsyncFunction> = [
  state: StateByAsyncFn<F>,
  call: (...args: Parameters<F>) => ReturnType<F>,
  getState: () => StateByAsyncFn<F>
];

export default function useAsync<F extends AnyAsyncFunction>(
  factory: () => UseAsyncProps<F> | F,
  deps: React.DependencyList = []
): UseAsyncResult<F> {
  const lastCallId = useRef(0);
  const activeCallsCount = useRef(0);
  const isMounted = useIsMounted();

  const { fn, onUnmount, ...initialState } = useMemo(
    () => {
      const fnOrProps = factory();
      if (typeof fnOrProps === 'function') return { fn: fnOrProps } as UseAsyncProps<F>;
      return fnOrProps;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  const [getState, setState] = useRefState<StateByAsyncFn<F>>(
    () =>
      ({
        loading: !!(initialState.loading ?? false),
        error: initialState.error,
        value: initialState.value,
      } as StateByAsyncFn<F>)
  );

  const call = useCallback(
    (...args: Parameters<F>): ReturnType<F> => {
      activeCallsCount.current += 1;
      lastCallId.current += 1;
      const callId = lastCallId.current;
      setState((prev) => ({ ...prev, loading: true }));

      // eslint-disable-next-line prefer-spread
      return fn
        .apply(undefined, args)
        .then(
          (value) => {
            // Update value only for latest call
            if (isMounted() && callId === lastCallId.current) {
              setState((prev) => ({ ...prev, value }));
            }
            return value;
          },
          (error) => {
            // Update error only for latest call
            if (isMounted() && callId === lastCallId.current) {
              setState((prev) => ({ ...prev, error }));
            }
            // return error;
          }
        )
        .finally(() => {
          if (isMounted()) {
            activeCallsCount.current = Math.max(0, activeCallsCount.current - 1);
            if (activeCallsCount.current === 0) {
              setState((prev) => ({ ...prev, loading: false }));
            }
          } else {
            onUnmount && onUnmount(getState());
          }
        }) as ReturnType<F>;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  useEffect(
    () => {
      if (initialState.loading) {
        void call(
          ...((Array.isArray(initialState.loading) ? initialState.loading : []) as Parameters<F>)
        );
      }

      return () => {
        // Eg clean resources, stop timers, etc
        onUnmount && onUnmount(getState());
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  return [getState(), call, getState];
}
