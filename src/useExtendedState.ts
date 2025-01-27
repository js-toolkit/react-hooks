import { useRef } from 'react';

interface ExtendFactory<S, T, SS extends React.Dispatch<React.SetStateAction<S>>> {
  (state: { get: () => S; set: SS }): T;
}

export default function useExtendedState<S, E, SS extends React.Dispatch<React.SetStateAction<S>>>(
  stateMethods: [getState: () => S, setState: SS, ...rest: unknown[]],
  extend: ExtendFactory<S, E, SS>
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
