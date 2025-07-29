import useMemoDestructor from './useMemoDestructor';

type UseRafCallbackResult<T extends AnyFunction> = T & { cancelRaf: () => void };

export default function useRafCallback<T extends AnyFunction>(
  callback: T,
  deps: React.DependencyList
): UseRafCallbackResult<T> {
  return useMemoDestructor(
    () => {
      let rafId: number;
      const cb = ((...args: unknown[]) => {
        rafId = requestAnimationFrame(() => {
          callback(...args);
        });
      }) as UseRafCallbackResult<T>;
      cb.cancelRaf = () => cancelAnimationFrame(rafId);
      return [cb, (inst) => inst.cancelRaf()];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );
}
