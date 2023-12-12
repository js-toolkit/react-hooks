import { useEffect, useMemo } from 'react';

/**
 * It uses `useEffect` to destruct a value.
 * Be careful: use destructor only for destruct prev created value.
 */
export default function useMemoDestructor<T>(
  factory: () => [value: T, destructor: (value: T) => void],
  deps: React.DependencyList = []
): T {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  const [value, destructor] = useMemo(factory, deps);

  useEffect(() => () => destructor(value), [destructor, value]);

  return value;
}

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
