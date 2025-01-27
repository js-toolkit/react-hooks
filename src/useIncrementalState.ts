import useExtendedState from './useExtendedState';
import useRefState, { type SetRefStateOptions } from './useRefState';

export interface UseIncrementalStateResult {
  inc: (options?: SetRefStateOptions) => void;
  readonly value: number;
}

export default function useIncrementalState(initialState = 0): UseIncrementalStateResult {
  const [store] = useExtendedState(useRefState(initialState), ({ get, set }) => ({
    inc: (options?: SetRefStateOptions) => {
      set((prev) => (prev >= Number.MAX_SAFE_INTEGER ? 1 : prev + 1), options);
    },
    get value() {
      return get();
    },
  }));
  return store;
}
