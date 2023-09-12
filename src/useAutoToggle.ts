import { useEffect, useMemo } from 'react';
import { debounce, type DebouncedFunc } from '@js-toolkit/utils/debounce';
import useRefState from './useRefState';
import useUpdatedRef from './useUpdatedRef';
import useMemoDestructor from './useMemoDestructor';

export interface ActivateOptions {
  /** Ignore disabled option. */
  readonly force?: boolean;
  /** Disable auto toggle. */
  readonly noWait?: boolean;
  /** Force update react state. */
  readonly forceUpdateState?: boolean;
}

export interface Activate {
  (options: ActivateOptions): void;
  (force: boolean): void;
  (): void;
}

export interface AutoToggleState {
  readonly isActive: (noWait?: boolean) => boolean;
  readonly isDisabled: () => boolean;
  readonly activate: Activate;
  readonly deactivate: VoidFunction;
  readonly deactivateDebounced: DebouncedFunc<VoidFunction>;
}

export interface UseAutoToggleProps {
  readonly initialValue?: boolean;
  readonly disabled?: boolean;
  /**
   * Time in milliseconds after which an active state set to false.
   * If <= 0 then timer creation is disabled.
   */
  readonly wait?: number;
}

/** Useful for tracking user interaction. */
export default function useAutoToggle({
  initialValue,
  disabled,
  wait = 3000,
}: UseAutoToggleProps = {}): AutoToggleState {
  const disabledRef = useUpdatedRef(disabled);
  const waitRef = useUpdatedRef(wait);

  const [getActive, setActive] = useRefState(!!initialValue && !disabled);

  const deactivateDebouncedRef = useUpdatedRef(
    useMemoDestructor(
      () => [debounce(() => getActive() && setActive(false), wait), (d) => d.cancel()],
      [getActive, setActive, wait]
    )
  );

  const state = useMemo<AutoToggleState>(() => {
    return {
      isActive: (noWait?: boolean) => {
        return getActive() && (!noWait || !deactivateDebouncedRef.current.isPending);
      },
      activate: (options: ActivateOptions | boolean = {}) => {
        const { force, noWait, forceUpdateState } =
          typeof options === 'boolean' ? ({ force: options } as ActivateOptions) : options;
        if (disabledRef.current && !force) {
          return;
        }
        if (forceUpdateState || !getActive()) {
          setActive(true);
        }
        // Do not debounce if disabled
        if (waitRef.current <= 0 || noWait) {
          deactivateDebouncedRef.current.cancel();
          return;
        }
        deactivateDebouncedRef.current();
      },
      deactivate: () => {
        deactivateDebouncedRef.current.cancel();
        if (getActive()) {
          setActive(false);
        }
      },
      get deactivateDebounced() {
        return deactivateDebouncedRef.current;
      },
      isDisabled: () => !!disabledRef.current,
    };
  }, [deactivateDebouncedRef, disabledRef, getActive, setActive, waitRef]);

  // useEffect(() => {
  //   if (initialValue && !disabled) {
  //     state.activate();
  //   }
  //   // eslint-disable-next-line react-hooks/exhaustive-deps
  // }, []);

  // Deactivate early if disabled changed to `true`
  useEffect(
    () => () => {
      !disabled && state.deactivate();
    },
    [disabled, state]
  );

  return state;
}
