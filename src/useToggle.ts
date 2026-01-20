import { useRefCallback } from './useRefCallback';
import { useRefState } from './useRefState';

export function useToggle(
  initialValue = false
): [value: boolean, toggle: (value?: unknown) => void, on: VoidFunction, off: VoidFunction] {
  const [get, set] = useRefState(initialValue);

  const on = useRefCallback(() => set(true));

  const off = useRefCallback(() => set(false));

  const toggle = useRefCallback((v?: unknown) => {
    const nextValue = v ?? !get();
    if (nextValue) on();
    else off();
  });

  return [get(), toggle, on, off];
}
