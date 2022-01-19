import type { SetStateAction, Dispatch } from 'react';
import useUpdateState, { StateGetter, UpdateState } from './useUpdateState';

export const getInputChangeEventValue: StateGetter<
  React.ChangeEvent<HTMLInputElement> | { value: string } | string,
  string
> = (event) => {
  if (typeof event === 'string') return event;
  if (typeof event === 'object') {
    if ('target' in event) return event.target.value;
    if ('value' in event) return event.value;
  }
  throw new Error(`Unsupported event '${event}'`);
};

export default function useInputState(
  initialState: string | (() => string)
): [
  () => string,
  UpdateState<React.ChangeEvent<HTMLInputElement> | { value: string } | string>,
  Dispatch<SetStateAction<string>>
] {
  const [get, set, update] = useUpdateState(initialState, getInputChangeEventValue);
  return [get, update, set];
}
