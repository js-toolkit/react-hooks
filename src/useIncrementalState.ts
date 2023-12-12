import useExtendedState from './useExtendedState';
import useRefState from './useRefState';

export interface UseIncrementalStateResult {
  inc: VoidFunction;
  readonly value: number;
}

export default function useIncrementalState(initialState = 0): UseIncrementalStateResult {
  const [store] = useExtendedState(useRefState(initialState), ({ get, set }) => ({
    inc: () => set((prev) => (prev >= Number.MAX_SAFE_INTEGER ? 1 : prev + 1)),
    get value() {
      return get();
    },
  }));

  return store;
}
