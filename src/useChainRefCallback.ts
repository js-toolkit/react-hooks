import useRefCallback from './useRefCallback';

export default function useChainRefCallback<T extends (...args: unknown[]) => void>(
  ...callbacks: (T | undefined)[]
): T {
  return useRefCallback(((...args) => {
    callbacks.forEach((cb) => {
      cb && cb(...args);
    });
  }) as T);
}
