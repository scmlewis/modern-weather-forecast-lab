import { useEffect, useRef } from 'react';

export const useAutoRefresh = (callback: () => void, intervalMs: number | null) => {
  const savedCallback = useRef(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (intervalMs == null || intervalMs <= 0) {
      return;
    }

    const tick = () => {
      if (document.visibilityState === 'visible') {
        savedCallback.current();
      }
    };

    const id = window.setInterval(tick, intervalMs);
    return () => window.clearInterval(id);
  }, [intervalMs]);
};
