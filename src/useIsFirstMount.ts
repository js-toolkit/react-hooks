import { useCallback, useRef } from 'react';

export default function useIsFirstMount(): () => boolean {
  const firstRef = useRef(true);
  const countRef = useRef(0);

  if (firstRef.current) {
    countRef.current += 1;
    if (countRef.current > 1) {
      firstRef.current = false;
    }
  }

  return useCallback(() => firstRef.current, []);
}
