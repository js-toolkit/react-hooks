import React, { useRef } from 'react';

interface ExtendFactory<S, T> {
  (state: { get: () => S; set: React.Dispatch<React.SetStateAction<S>> }): T;
}

export default function useExtendedState<S, E>(
  stateMethods: [
    getState: () => S,
    setState: React.Dispatch<React.SetStateAction<S>>,
    ...rest: unknown[]
  ],
  extend: ExtendFactory<S, E>
): [E, ...typeof stateMethods] {
  const extended = useRef<E>(undefined as unknown as E);

  if (!extended.current) {
    extended.current = extend({ get: stateMethods[0], set: stateMethods[1] });
  }

  return [extended.current, ...stateMethods];
}

// export default function useExtendedState<S, E>(
//   state: S | ((prevState?: S) => S),
//   extend: ExtendFactory<S, E>,
//   updateStateDeps: React.DependencyList = []
// ): [getState: () => S, setState: React.Dispatch<React.SetStateAction<S>>, extended: E] {
//   const [getState, setState] = useUpdatedState(state, updateStateDeps);
//   const isFirstMount = useIsFirstMount();

//   const extended = useRef<E>(undefined as unknown as E);
//   if (extend && isFirstMount()) {
//     extended.current = extend({ get: getState, set: setState });
//   }

//   return [getState, setState, extended.current];
// }
