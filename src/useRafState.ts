import useRafCallback from './useRafCallback';
import useRefState, { type SetRefStateOptions } from './useRefState';

export default function useRafState<S = undefined>(): [
  getState: () => S | undefined,
  setState: (nextState: React.SetStateAction<S | undefined>, options?: SetRefStateOptions) => void,
];

export default function useRafState<S>(
  initialState: S | (() => S)
): [
  getState: () => S,
  setState: (nextState: React.SetStateAction<S>, options?: SetRefStateOptions) => void,
];

export default function useRafState<S>(
  initialState?: S | (() => S)
): [
  getState: () => S | undefined,
  setState: (nextState: React.SetStateAction<S | undefined>, options?: SetRefStateOptions) => void,
] {
  const [getState, setState] = useRefState(initialState);

  const setRafState = useRafCallback<typeof setState>(
    (value, options) => setState(value, options),
    [setState]
  );

  return [getState, setRafState];
}
