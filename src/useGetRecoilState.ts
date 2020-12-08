import { Snapshot, useRecoilCallback } from 'recoil';

export default function useGetRecoilState(): Snapshot['getPromise'] {
  const getState = useRecoilCallback(
    ({ snapshot }): Snapshot['getPromise'] => (store) => snapshot.getPromise(store),
    []
  );

  return getState as Snapshot['getPromise'];
}
