import { useMemo } from 'react';
import { Queue } from '@js-toolkit/utils/Queue';
import useRefCallback from './useRefCallback';
import useUpdatedRefState from './useUpdatedRefState';

export type UseQueueResult<T> = [
  queueItem: T | undefined,
  nextInQueue: () => boolean,
  getQueue: () => Queue<T>,
];

export function useQueue<T>(
  value: T | readonly T[],
  deps: React.DependencyList = [value]
): UseQueueResult<T> {
  const queue = useMemo(
    () => new Queue(Array.isArray(value) ? value : [value]),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    deps
  );

  const [getItem, setItem] = useUpdatedRefState(() => queue.take(), [queue]);
  const queueItem = getItem();

  const nextInQueue = useRefCallback(() => {
    const nextQueueItem = queue.take();
    setItem(nextQueueItem);
    return nextQueueItem != null;
  });

  const getQueue = useRefCallback(() => queue);

  return [queueItem, nextInQueue, getQueue];
}
