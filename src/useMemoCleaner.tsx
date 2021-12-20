import React, { useEffect, useMemo } from 'react';

// export default function useMemoCleaner<T>(
//   factory: () => [value: T, clean: (value: T, unmount: boolean) => void],
//   deps: React.DependencyList | undefined
// ): T {
//   const valueRef = useRef<ReturnType<typeof factory>>();

//   valueRef.current = useMemo(
//     () => {
//       if (valueRef.current) {
//         const [prevVal, prevClean] = valueRef.current;
//         prevClean(prevVal, false);
//       }
//       return factory();
//     },
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//     deps
//   );

//   useEffect(
//     () => () => {
//       console.log('UNMOUNT');

//       if (valueRef.current) {
//         const [value, clean] = valueRef.current;
//         clean(value, true);
//       }
//     },
//     []
//   );

//   return valueRef.current[0];
// }

/**
 * It uses `useEffect` to clean value.
 * Be careful: use cleaner only for clean prev created value.
 */
export default function useMemoCleaner<T>(
  factory: () => [value: T, cleaner: (value: T) => void],
  deps: React.DependencyList | undefined
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [value, cleaner] = useMemo(factory, deps);

  useEffect(() => () => cleaner(value), [cleaner, value]);

  return value;
}
