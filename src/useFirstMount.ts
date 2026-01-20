/* eslint-disable react-hooks/refs */
import { useRef } from 'react';

export function useFirstMount(): boolean {
  const firstRef = useRef(true);

  if (firstRef.current) {
    firstRef.current = false;
    return true;
  }

  return firstRef.current;
}
