import { MutableRefObject, RefObject, useRef } from 'react';

type UpdateRef<A, B> = (value: A) => B;

function useRefUpdate<T>(initialValue: T, update?: UpdateRef<T, T>): MutableRefObject<T>;

function useRefUpdate<T>(
  initialValue: T | null,
  update?: UpdateRef<T | null, T | null>
): RefObject<T>;

function useRefUpdate<T = undefined>(
  update?: UpdateRef<T | undefined, T | undefined>
): MutableRefObject<T | undefined>;

function useRefUpdate<T>(
  value: T | undefined | null,
  update?: UpdateRef<T | undefined | null, T | undefined | null>
): unknown {
  const ref = useRef(value);
  ref.current = update ? update(value) : value;
  return ref;
}

export default useRefUpdate;
