import React from 'react';
import { debounce, type DebouncedFunc } from '@js-toolkit/utils/debounce';
import useRefCallback from './useRefCallback';

export default function useDebounceCallback<
  T extends AnyFunction | undefined,
  C extends Exclude<ThisParameterType<NonNullable<T>>, unknown> = Exclude<
    ThisParameterType<NonNullable<T>>,
    unknown
  >,
>(
  callback: NonNullable<T>,
  wait: number,
  context: C | undefined = undefined
): DebouncedFunc<NonNullable<T>> {
  const cb = useRefCallback(callback, context);
  return React.useMemo(() => debounce(cb, wait), [cb, wait]);
}
