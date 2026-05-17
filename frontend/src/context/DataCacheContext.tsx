import { createContext, useContext, useMemo, useRef, type ReactNode } from "react";

type CacheEntry<T> = {
  value: T;
  updatedAt: number;
};

type DataCacheContextValue = {
  getCache: <T,>(key: string) => CacheEntry<T> | null;
  setCache: <T,>(key: string, value: T) => void;
  invalidateCache: (keyPrefix?: string) => void;
};

const DataCacheContext = createContext<DataCacheContextValue | undefined>(undefined);

export const DataCacheProvider = ({ children }: { children: ReactNode }) => {
  const cacheRef = useRef(new Map<string, CacheEntry<unknown>>());

  const value = useMemo<DataCacheContextValue>(
    () => ({
      getCache: <T,>(key: string) => cacheRef.current.get(key) as CacheEntry<T> | null ?? null,
      setCache: <T,>(key: string, value: T) => {
        cacheRef.current.set(key, { value, updatedAt: Date.now() });
      },
      invalidateCache: (keyPrefix) => {
        if (!keyPrefix) {
          cacheRef.current.clear();
          return;
        }

        for (const key of cacheRef.current.keys()) {
          if (key.startsWith(keyPrefix)) {
            cacheRef.current.delete(key);
          }
        }
      },
    }),
    []
  );

  return <DataCacheContext.Provider value={value}>{children}</DataCacheContext.Provider>;
};

export const useDataCache = () => {
  const context = useContext(DataCacheContext);

  if (!context) {
    throw new Error("useDataCache must be used inside DataCacheProvider");
  }

  return context;
};
