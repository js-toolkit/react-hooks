import { useCallback, useEffect, useRef } from 'react';

export default function useIsMounted(): () => boolean {
  const moutedRef = useRef(false);

  useEffect(() => {
    moutedRef.current = true;

    return () => {
      moutedRef.current = false;
    };
  }, []);

  return useCallback(() => moutedRef.current, []);
}
