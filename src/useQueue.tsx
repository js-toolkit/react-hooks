import React from 'react';
import { Queue } from '@js-toolkit/utils/Queue';
import useRefCallback from './useRefCallback';
import useUpdatedRefState from './useUpdatedRefState';

export type UseQueueResult<T> = [
  queueItem: T | undefined,
  nextInQueue: () => boolean,
  queue: Queue<T>,
];

export function useQueue<T>(
  value: T | readonly T[],
  deps: React.DependencyList = [value]
): UseQueueResult<T> {
  const queue = React.useMemo(
    () => new Queue(Array.isArray(value) ? value : [value]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  const [getItem, setItem] = useUpdatedRefState(() => queue.take(), [queue]);
  const queueItem = getItem();

  const nextInQueue = useRefCallback(() => {
    const nextQueueItem = queue.take();
    if (nextQueueItem) setItem(nextQueueItem);
    return nextQueueItem != null;
  });

  return [queueItem, nextInQueue, queue];
}
