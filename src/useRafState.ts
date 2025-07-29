import useRafCallback from './useRafCallback';
import useRefState, { type SetRefStateOptions } from './useRefState';

type SetState<F extends AnyFunction> = ReturnType<typeof useRafCallback<F>>;

export default function useRafState<S = undefined>(): [
  getState: () => S | undefined,
  setState: SetState<
    (nextState: React.SetStateAction<S | undefined>, options?: SetRefStateOptions) => void
  >,
];

export default function useRafState<S>(
  initialState: S | (() => S)
): [
  getState: () => S,
  setState: SetState<(nextState: React.SetStateAction<S>, options?: SetRefStateOptions) => void>,
];

export default function useRafState<S>(
  initialState?: S | (() => S)
): [
  getState: () => S | undefined,
  setState: SetState<
    (nextState: React.SetStateAction<S | undefined>, options?: SetRefStateOptions) => void
  >,
] {
  const [getState, setState] = useRefState(initialState);

  const setRafState = useRafCallback<typeof setState>(setState, [setState]);

  return [getState, setRafState];
}
