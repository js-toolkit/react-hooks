import useRefCallback from './useRefCallback';

export default function useChainRefCallback<T extends AnyFunction>(
  ...callbacks: (T | undefined)[]
): T {
  return useRefCallback(((...args) => {
    callbacks.forEach((cb) => {
      // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
      cb && cb(...args);
    });
  }) as T);
}
