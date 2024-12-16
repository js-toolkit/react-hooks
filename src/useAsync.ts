import React from 'react';
import useIsMounted from './useIsMounted';
import useRefState from './useRefState';

type AsyncState<T> =
  | {
      pending: true;
      error?: unknown;
      value?: T | undefined;
    }
  | {
      pending: false;
      error: unknown;
      value?: undefined;
    }
  | {
      pending: false;
      error?: undefined;
      value: T | undefined;
    };

type StateByAsyncFn<F extends AnyAsyncFunction> = AsyncState<Awaited<ReturnType<F>>>;

export type UseAsyncProps<F extends AnyAsyncFunction> = Partial<StateByAsyncFn<F>> & {
  /** Action parameters or boolean for initial calling of action. */
  pending?: Parameters<F> | boolean;
  action: F;
  /** Called when the `deps` changes or the component is unmount. Eg. clean resources, stop timers, etc. */
  onUnmount?: (state: StateByAsyncFn<F>) => void;
};

type UseAsyncResult<F extends AnyAsyncFunction> = [
  state: StateByAsyncFn<F>,
  call: (...args: Parameters<F>) => ReturnType<F>,
  getState: () => StateByAsyncFn<F>,
];

export default function useAsync<F extends AnyAsyncFunction>(
  factory: () => UseAsyncProps<F> | F,
  deps: React.DependencyList = []
): UseAsyncResult<F> {
  const lastCallId = React.useRef(0);
  const activeCallsCount = React.useRef(0);
  const isMounted = useIsMounted();

  const { action, onUnmount, ...initialState } = React.useMemo(
    () => {
      const actionOrProps = factory();
      if (typeof actionOrProps === 'function') return { action: actionOrProps } as UseAsyncProps<F>;
      return actionOrProps;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  const [getState, setState] = useRefState<StateByAsyncFn<F>>(() => ({
    pending: !!(initialState.pending ?? false),
    error: initialState.error,
    value: initialState.value,
  }));

  const call = React.useCallback(
    (...args: Parameters<F>): ReturnType<F> => {
      activeCallsCount.current += 1;
      lastCallId.current += 1;
      const callId = lastCallId.current;
      setState((prev) => ({ ...prev, pending: true }));

      // eslint-disable-next-line prefer-spread
      return action
        .apply(undefined, args)
        .then(
          (value: Awaited<ReturnType<F>>) => {
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
              setState((prev) => ({ ...prev, pending: false }));
            }
          } else {
            onUnmount && onUnmount(getState());
          }
        }) as ReturnType<F>;
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  React.useEffect(
    () => {
      if (initialState.pending) {
        void call(
          ...((Array.isArray(initialState.pending) ? initialState.pending : []) as Parameters<F>)
        );
      }

      return () => {
        // Eg. clean resources, stop timers, etc.
        onUnmount && onUnmount(getState());
      };
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  return [getState(), call, getState];
}
