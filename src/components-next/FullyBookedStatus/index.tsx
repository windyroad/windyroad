'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

interface FullyBookedStatusContextValue {
  value: string;
  setStatus: (message: string) => void;
}

const FullyBookedStatusContext = createContext<FullyBookedStatusContextValue | null>(
  null,
);

export function FullyBookedStatusProvider({ children }: { children: ReactNode }) {
  const [value, setValue] = useState('');

  const setStatus = useCallback((message: string) => {
    setValue('');
    if (typeof window !== 'undefined' && typeof requestAnimationFrame === 'function') {
      requestAnimationFrame(() => setValue(message));
    } else {
      setValue(message);
    }
  }, []);

  const contextValue = useMemo<FullyBookedStatusContextValue>(
    () => ({ value, setStatus }),
    [value, setStatus],
  );

  return (
    <FullyBookedStatusContext.Provider value={contextValue}>
      {children}
    </FullyBookedStatusContext.Provider>
  );
}

export function useFullyBookedStatus(): FullyBookedStatusContextValue {
  const ctx = useContext(FullyBookedStatusContext);
  if (!ctx) {
    return { value: '', setStatus: () => {} };
  }
  return ctx;
}

export function FullyBookedStatus() {
  const { value } = useFullyBookedStatus();
  return (
    <div
      role="status"
      aria-live="polite"
      aria-atomic="true"
      className="sr-only"
    >
      {value}
    </div>
  );
}
