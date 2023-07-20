import { useCallback, useMemo } from 'react';
import useRefState from './useRefState';

export type PendingTasks<TaskKeys extends string> = { default: number } & {
  [P in TaskKeys]?: number;
};

export interface UsePendingResult<TaskKeys extends string> {
  isPending: (key?: keyof PendingTasks<TaskKeys>) => boolean;
  isAnyPending: () => boolean;
  push: (key?: keyof PendingTasks<TaskKeys>) => void;
  pop: (key?: keyof PendingTasks<TaskKeys>) => void;
  reset: (key?: keyof PendingTasks<TaskKeys>) => void;
  resetAll: VoidFunction;
}

export default function usePendingTasks<
  TaskKeys extends string = never,
>(): UsePendingResult<TaskKeys> {
  const [getPendingTasks, setPendingTasks] = useRefState<PendingTasks<TaskKeys>>({
    default: 0,
  });

  /** true - while has at least 1 running task by key. */
  const isPending = useCallback(
    (key: keyof PendingTasks<TaskKeys> = 'default'): boolean => {
      // console.log('calc pending', key, this.pendingTasks[key]);
      return (getPendingTasks()[key] ?? 0) > 0;
    },
    [getPendingTasks]
  );

  /** true - while has at least 1 running task. */
  const isAnyPending = useCallback((): boolean => {
    // console.log('calc any pending', key, this.pendingTasks[key]);
    return Object.values(getPendingTasks()).some((count) => count > 0);
  }, [getPendingTasks]);

  const push = useCallback(
    (key: keyof PendingTasks<TaskKeys> = 'default') => {
      // console.log('push', key);
      setPendingTasks((prev) => ({ ...prev, [key]: (prev[key] ?? 0) + 1 }));
    },
    [setPendingTasks]
  );

  const pop = useCallback(
    (key: keyof PendingTasks<TaskKeys> = 'default') => {
      // console.log('pop', key);
      const value = getPendingTasks()[key] ?? 0;
      if (value === 0) return;
      setPendingTasks((prev) => ({ ...prev, [key]: value - 1 }));
    },
    [getPendingTasks, setPendingTasks]
  );

  const reset = useCallback(
    (key: keyof PendingTasks<TaskKeys> = 'default') => {
      if (!isPending(key)) return;
      setPendingTasks((prev) => ({ ...prev, [key]: key === 'default' ? 0 : undefined }));
    },
    [isPending, setPendingTasks]
  );

  const resetAll = useCallback(() => {
    if (!isAnyPending()) return;
    setPendingTasks({ default: 0 });
  }, [isAnyPending, setPendingTasks]);

  return useMemo<UsePendingResult<TaskKeys>>(
    () => ({ isPending, isAnyPending, push, pop, reset, resetAll }),
    [isPending, isAnyPending, push, pop, reset, resetAll]
  );
}
