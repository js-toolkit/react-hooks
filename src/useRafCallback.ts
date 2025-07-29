import { clear } from '@js-toolkit/utils/clear';
import useMemoDestructor from './useMemoDestructor';

type UseRafCallbackResult<T extends AnyFunction> = T & { cancelRaf: () => void };

export default function useRafCallback<T extends AnyFunction>(
  callback: T,
  deps: React.DependencyList
): UseRafCallbackResult<T> {
  return useMemoDestructor(
    () => {
      const queue: number[] = [];

      const cb = ((...args: unknown[]) => {
        const rafId = requestAnimationFrame(() => {
          queue.shift();
          callback(...args);
        });
        queue.push(rafId);
      }) as UseRafCallbackResult<T>;

      cb.cancelRaf = () => {
        queue.forEach(cancelAnimationFrame);
        clear(queue);
      };

      return [cb, (inst) => inst.cancelRaf()];
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );
}
