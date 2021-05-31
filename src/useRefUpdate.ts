import { useRef } from 'react';

export default (function useRefUpdate(value: unknown): unknown {
  const ref = useRef(value);
  ref.current = value;
  return ref;
} as typeof useRef);
