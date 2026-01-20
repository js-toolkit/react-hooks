/* eslint-disable react-hooks/refs */
import { useRef } from 'react';
import { useRefCallback } from './useRefCallback';

export function useIsFirstMount(): () => boolean {
  const firstRef = useRef(true);
  const countRef = useRef(0);

  if (firstRef.current) {
    countRef.current += 1;
    if (countRef.current > 1) {
      firstRef.current = false;
    }
  }

  return useRefCallback(() => firstRef.current);
}
