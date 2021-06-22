import { Reducer, useCallback, useReducer } from 'react';

const toggleReducer = (state: boolean, nextValue?: unknown): boolean =>
  typeof nextValue === 'boolean' ? nextValue : !state;

export default function useToggle(
  initialValue = false
): [value: boolean, toggle: (value?: unknown) => void, on: VoidFunction, off: VoidFunction] {
  const [value, dispatch] = useReducer<Reducer<boolean, unknown>>(toggleReducer, initialValue);

  const on = useCallback(() => dispatch(true), []);
  const off = useCallback(() => dispatch(false), []);

  return [value, dispatch, on, off];
}
