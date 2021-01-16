import { useRef, useState } from "react";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function useAsyncState<T = any>(
  initialState: T
): [React.MutableRefObject<T>, (value: T) => void] {
  const reference = useRef<T>(initialState);

  const [, forceUpdate] = useState<boolean>(false);

  const setState = (value: T) => {
    reference.current = value;
    forceUpdate((previousValue) => !previousValue);
  };

  return [reference, setState];
}
