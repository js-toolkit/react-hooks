/* eslint-disable react-hooks/refs */
import { useRef } from 'react';

type UpdateRef<A, B> = (nextValue: A, prevValue: A) => B;

const nullValue = Symbol.for('@@__useUpdatedRef_initial');

export function useUpdatedRef<T>(value: T, update?: UpdateRef<T, T>): React.MutableRefObject<T>;

export function useUpdatedRef<T>(
  value: T | null,
  update?: UpdateRef<T | null, T | null>
): React.RefObject<T>;

export function useUpdatedRef<T>(
  value: T | undefined | null,
  update?: UpdateRef<T | undefined | null, T | undefined | null>
): unknown {
  const ref = useRef(nullValue as typeof value);
  if (ref.current === nullValue) {
    ref.current = value;
  }
  // Update on every render
  else {
    ref.current = update ? update(value, ref.current) : value;
  }
  return ref;
}
