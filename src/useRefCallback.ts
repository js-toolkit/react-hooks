import { useRef } from 'react';

interface RefCallback<T extends AnyFunction> {
  callee: T;
  caller: T;
}

export default function useRefCallback<
  T extends AnyFunction,
  C extends Exclude<ThisParameterType<T>, unknown> = Exclude<ThisParameterType<T>, unknown>,
>(callback: T, context: C | undefined = undefined): T {
  const ref = useRef<RefCallback<T>>();

  if (!ref.current) {
    ref.current = {
      callee: callback,
      // eslint-disable-next-line func-names
      caller: function (...args) {
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        return ref.current!.callee.apply(context, args) as unknown;
      } as T,
    };
  } else {
    ref.current.callee = callback;
  }

  return ref.current.caller;
}
