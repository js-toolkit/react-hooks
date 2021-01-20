import { useState, useCallback, SetStateAction, Dispatch, useRef } from 'react';

export type ValueGetter<E, S> = (event: E) => S;

export type ChangeEventHandler<E> = (event: E) => void;

export function getValueOrEvent<S>(event: { value: S } | S): S {
  if (typeof event === 'object' && 'value' in event) return event.value;
  // Do not throw error because `S` may be an `object` type or any simple type.
  return event;
}

export default function useStateChange<S, E = { value: S } | S>(
  initialState: S | (() => S),
  getValue: ValueGetter<E, S> = getValueOrEvent as ValueGetter<E, S>
): [
  getState: () => S,
  changeEventHandler: ChangeEventHandler<E>,
  setState: Dispatch<SetStateAction<S>>
] {
  const [value, setValue] = useState(initialState);
  const valueRef = useRef(value);
  valueRef.current = value;

  const getValueRef = useRef(getValue);
  getValueRef.current = getValue;

  const changeHandler = useCallback<ChangeEventHandler<E>>(
    (event) => setValue(getValueRef.current(event)),
    []
  );

  const getState = useCallback(() => valueRef.current, []);

  return [getState, changeHandler, setValue];
}
