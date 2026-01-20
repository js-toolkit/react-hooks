import { useRefCallback } from './useRefCallback';

export function useChainRefCallback<T extends AnyFunction>(...callbacks: (T | undefined)[]): T {
  return useRefCallback(((...args) => {
    callbacks.forEach((cb) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      cb && cb(...args);
    });
  }) as T);
}
