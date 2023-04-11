import { type MutableRefObject, type RefObject, useRef } from 'react';
import useFirstMount from './useFirstMount';

type UpdateRef<A, B> = (nextValue: A, prevValue: A | undefined) => B;

function useUpdatedRef<T>(initialValue: T, update?: UpdateRef<T, T>): MutableRefObject<T>;

function useUpdatedRef<T>(
  initialValue: T | null,
  update?: UpdateRef<T | null, T | null>
): RefObject<T>;

function useUpdatedRef<T>(
  value: T | undefined | null,
  update?: UpdateRef<T | undefined | null, T | undefined | null>
): unknown {
  const ref = useRef(value);
  const firstMount = useFirstMount();
  if (!firstMount) {
    ref.current = update ? update(value, ref.current) : value;
  }
  return ref;
}

export default useUpdatedRef;
