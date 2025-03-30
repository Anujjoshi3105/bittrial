import { useRef } from "react";

export default function useDebounceCallback(delay = 300) {
  const ref = useRef<number | null>(null);

  // eslint-disable-next-line @typescript-eslint/no-unsafe-function-type
  const delayedCallback = (cb: Function) => {
    if (ref.current === null) {
      const timeoutId = setTimeout(cb, delay);
      ref.current = timeoutId;
    } else {
      clearTimeout(ref.current);
      const newTimeoutId = setTimeout(cb, delay);
      ref.current = newTimeoutId;
    }
  };

  return { delayedCallback };
}
