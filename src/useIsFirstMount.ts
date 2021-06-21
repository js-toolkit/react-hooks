import { useCallback, useEffect, useRef } from 'react';

export default function useIsFirstMount(): () => boolean {
  const firstRef = useRef(true);
  const countRef = useRef(0);

  useEffect(() => {
    if (!firstRef.current) return;
    countRef.current += 1;
    if (countRef.current > 0) {
      firstRef.current = false;
    }
  }, []);

  return useCallback(() => firstRef.current, []);
}
