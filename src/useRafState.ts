import useRafCallback from './useRafCallback';
import useRefState, { SetRefStateOptions, UpdateState } from './useRefState';

export default function useRafState<S = undefined>(): [
  getState: () => S | undefined,
  setState: (nextState: React.SetStateAction<S | undefined>, options?: SetRefStateOptions) => void,
  patch: UpdateState<S | undefined>
];

export default function useRafState<S>(
  initialState: S | (() => S)
): [
  getState: () => S,
  setState: (nextState: React.SetStateAction<S>, options?: SetRefStateOptions) => void,
  patch: UpdateState<S>
];

export default function useRafState<S>(
  initialState?: S | (() => S)
): [
  getState: () => S | undefined,
  setState: (nextState: React.SetStateAction<S | undefined>, options?: SetRefStateOptions) => void,
  patch: UpdateState<S | undefined>
] {
  const [getState, setState, patch] = useRefState(initialState);

  const setRafState: typeof setState = useRafCallback((value) => setState(value), [setState]);

  return [getState, setRafState, patch];
}
