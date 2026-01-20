/* eslint-disable react-hooks/refs */
import { useRef } from 'react';

interface RefCallback<T extends AnyFunction> {
  callee: T;
  caller: T;
}

export function useRefCallback<
  T extends AnyFunction | undefined,
  C extends Exclude<ThisParameterType<NonNullable<T>>, unknown> = Exclude<
    ThisParameterType<NonNullable<T>>,
    unknown
  >,
>(callback: NonNullable<T>, context: C | undefined = undefined): NonNullable<T> {
  const ref = useRef<RefCallback<NonNullable<T>>>(undefined);

  if (!ref.current) {
    ref.current = {
      callee: callback,
      // eslint-disable-next-line func-names
      caller: function (...args) {
        return ref.current!.callee.apply(context, args) as unknown;
      } as NonNullable<T>,
    };
  } else {
    ref.current.callee = callback;
  }

  return ref.current.caller;
}
