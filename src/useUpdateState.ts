import { useState, useCallback, SetStateAction, Dispatch } from 'react';
import useRefUpdate from './useRefUpdate';

export type StateGetter<E, S> = (wrappedOrValue: E) => S;

export type UpdateState<E> = (wrappedOrValue: E) => void;

export function getValue<S>(wrappedOrValue: { value: S } | S): S {
  if (typeof wrappedOrValue === 'object' && 'value' in wrappedOrValue) return wrappedOrValue.value;
  // Do not throw error because `S` may be an `object` type or any simple type.
  return wrappedOrValue;
}

export default function useUpdateState<S, E = { value: S } | S>(
  initialState: S | (() => S),
  stateGetter: StateGetter<E, S> = getValue as StateGetter<E, S>
): [getState: () => S, setState: Dispatch<SetStateAction<S>>, updateState: UpdateState<E>] {
  const [state, setState] = useState(initialState);
  const stateRef = useRefUpdate(state);
  const stateGetterRef = useRefUpdate(stateGetter);

  const updateState = useCallback<UpdateState<E>>(
    (event) => setState(stateGetterRef.current(event)),
    [stateGetterRef]
  );

  const getState = useCallback(() => stateRef.current, [stateRef]);

  return [getState, setState, updateState];
}
