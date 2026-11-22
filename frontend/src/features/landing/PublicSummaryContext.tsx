import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from 'react';
import { publicSummaryService } from '../../services/publicSummaryService';
import type { PublicMapSummary } from '../../types/publicSummary';

interface PublicSummaryState {
  summary: PublicMapSummary | null;
  isLoading: boolean;
  hasError: boolean;
  updatedAt: Date | null;
  refresh: () => Promise<void>;
}

const PublicSummaryContext = createContext<PublicSummaryState | null>(null);

export function PublicSummaryProvider({ children }: { children: ReactNode }) {
  const [summary, setSummary] = useState<PublicMapSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [updatedAt, setUpdatedAt] = useState<Date | null>(null);
  const refresh = useCallback(async () => {
    try {
      setSummary(await publicSummaryService.getSummary());
      setHasError(false);
      setUpdatedAt(new Date());
    } catch {
      setHasError(true);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    void refresh();
    const interval = window.setInterval(() => void refresh(), 60_000);
    window.addEventListener('focus', refresh);
    return () => {
      window.clearInterval(interval);
      window.removeEventListener('focus', refresh);
    };
  }, [refresh]);

  return <PublicSummaryContext.Provider value={{ summary, isLoading, hasError, updatedAt, refresh }}>{children}</PublicSummaryContext.Provider>;
}

export function usePublicSummary() {
  const context = useContext(PublicSummaryContext);
  if (!context) throw new Error('usePublicSummary must be used within PublicSummaryProvider');
  return context;
}
