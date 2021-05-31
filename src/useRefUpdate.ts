import { useRef } from 'react';

const useRefUpdate = function useUpdateRef(value: unknown): unknown {
  const ref = useRef(value);
  ref.current = value;
  return ref;
} as typeof useRef;

export default useRefUpdate;
