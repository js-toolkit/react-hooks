import { MutableRefObject, RefObject, useRef } from 'react';
import useFirstMount from './useFirstMount';

type UpdateRef<A, B> = (value: A) => B;

function useUpdatedRef<T>(initialValue: T, update?: UpdateRef<T, T>): MutableRefObject<T>;

function useUpdatedRef<T>(
  initialValue: T | null,
  update?: UpdateRef<T | null, T | null>
): RefObject<T>;

function useUpdatedRef<T = undefined>(
  update?: UpdateRef<T | undefined, T | undefined>
): MutableRefObject<T | undefined>;

function useUpdatedRef<T>(
  value: T | undefined | null,
  update?: UpdateRef<T | undefined | null, T | undefined | null>
): unknown {
  const ref = useRef(value);
  const firstMount = useFirstMount();
  if (!firstMount) {
    ref.current = update ? update(value) : value;
  }
  return ref;
}

export default useUpdatedRef;
