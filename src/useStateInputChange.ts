import { SetStateAction, Dispatch } from 'react';
import useChangeEventHandler, { ValueGetter, ChangeEventHandler } from './useStateChange';

export const getInputChangeEventValue: ValueGetter<
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

export default function useStateInputChange(
  initialState: string | (() => string)
): [
  () => string,
  ChangeEventHandler<React.ChangeEvent<HTMLInputElement> | { value: string } | string>,
  Dispatch<SetStateAction<string>>
] {
  return useChangeEventHandler(initialState, getInputChangeEventValue);
}
