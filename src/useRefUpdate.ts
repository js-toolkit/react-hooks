import { useRef } from 'react';

export default function useRefUpdate<T>(value: T): React.MutableRefObject<T> {
  const ref = useRef<T>(value);
  ref.current = value;
  return ref;
}
